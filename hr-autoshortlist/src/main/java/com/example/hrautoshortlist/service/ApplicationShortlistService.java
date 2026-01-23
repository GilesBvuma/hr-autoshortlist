package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.dto.ParsedCVData;
import com.example.hrautoshortlist.dto.ShortlistResult;
import com.example.hrautoshortlist.entity.Application;
import com.example.hrautoshortlist.entity.Job;
import com.example.hrautoshortlist.entity.JobCriteria;
import com.example.hrautoshortlist.repository.ApplicationRepository;
import com.example.hrautoshortlist.repository.JobCriteriaRepository;
import com.example.hrautoshortlist.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced AI-powered shortlisting service for job applications.
 * Scores applicants based on parsed CV data and job criteria.
 */
@Service
public class ApplicationShortlistService {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationShortlistService.class);

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final JobCriteriaRepository jobCriteriaRepository;
    private final CVParsingService cvParsingService;

    public ApplicationShortlistService(ApplicationRepository applicationRepository,
            JobRepository jobRepository,
            JobCriteriaRepository jobCriteriaRepository,
            CVParsingService cvParsingService) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.jobCriteriaRepository = jobCriteriaRepository;
        this.cvParsingService = cvParsingService;
    }

    /**
     * Shortlist top N applications for a job based on intelligent scoring.
     */
    public List<ShortlistResult> shortlistApplications(Long jobId, int topN) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));

        List<Application> applications = applicationRepository.findByJob_Id(jobId);
        logger.info("Shortlisting {} applications for job {}, selecting top {}", applications.size(), jobId, topN);

        // RESET previous shortlists for this job
        for (Application app : applications) {
            if (app.isShortlisted()) {
                app.setShortlisted(false);
                applicationRepository.save(app);
            }
        }

        // Get or create job criteria
        JobCriteria criteria = jobCriteriaRepository.findByJobId(jobId)
                .orElseGet(() -> createDefaultCriteria(job));

        List<ShortlistResult> results = new ArrayList<>();

        for (Application app : applications) {
            try {
                // ✨ CHANGED: Always re-parse to ensure the latest AI logic is applied
                // This fixes the issue where old (wrong) "Masters" detections were stuck in the
                // database
                logger.info("Updating AI analysis for application {}", app.getId());
                cvParsingService.parseAndSaveCV(app, true); // Added 'true' to force refresh
                ParsedCVData cvData = cvParsingService.getParsedCVData(app.getId());

                // Compute score
                double score = computeEnhancedScore(app, job, criteria, cvData);

                String applicantName = app.getCandidateUser() != null ? app.getCandidateUser().getFullName()
                        : "Unknown";
                String applicantEmail = app.getCandidateUser() != null ? app.getCandidateUser().getEmail() : "";

                String reason = buildScoreReason(app, job, criteria, cvData, score);

                results.add(new ShortlistResult(
                        app.getId(),
                        applicantName,
                        applicantEmail,
                        score,
                        false, // Will set shortlisted flag below
                        reason));

            } catch (Exception e) {
                logger.error("Error scoring application {}", app.getId(), e);
                // Add with low score if error
                results.add(new ShortlistResult(
                        app.getId(),
                        app.getCandidateUser() != null ? app.getCandidateUser().getFullName() : "Unknown",
                        app.getCandidateUser() != null ? app.getCandidateUser().getEmail() : "",
                        0.0,
                        false,
                        "Error scoring application: " + e.getMessage()));
            }
        }

        // Sort by score descending
        results.sort(Comparator.comparingDouble(ShortlistResult::getComputedScore).reversed());

        // Mark top N as shortlisted
        for (int i = 0; i < Math.min(topN, results.size()); i++) {
            ShortlistResult result = results.get(i);
            result.setShortlisted(true);

            // PERSIST to database
            Application app = applicationRepository.findById(result.getApplicationId()).orElse(null);
            if (app != null) {
                app.setShortlisted(true);
                applicationRepository.save(app);
            }
        }

        logger.info("Shortlisting complete. Top score: {}",
                results.isEmpty() ? 0 : results.get(0).getComputedScore());

        return results;
    }

    /**
     * Compute enhanced score using parsed CV data and job criteria
     */
    private double computeEnhancedScore(Application app, Job job, JobCriteria criteria, ParsedCVData cvData) {
        double score = 0.0;

        // If CV parsing failed or no data, fall back to basic scoring
        if (cvData == null || cvData.getExtractedSkills().isEmpty()) {
            logger.warn("No parsed CV data for application {}, using fallback scoring", app.getId());
            return computeFallbackScore(app, job);
        }

        // 1. Skills matching (default 40%)
        double skillsScore = calculateSkillsMatch(cvData.getExtractedSkills(),
                criteria.getRequiredSkills(),
                criteria.getPreferredSkills());
        score += skillsScore * criteria.getSkillsWeight();

        // 2. Experience matching (default 25%)
        double expScore = calculateExperienceMatch(cvData.getYearsOfExperience(),
                criteria.getMinimumYearsExperience());
        score += expScore * criteria.getExperienceWeight();

        // 3. Education matching (default 20%)
        double eduScore = calculateEducationMatch(cvData.getEducationLevel(),
                criteria.getRequiredEducationLevels());
        score += eduScore * criteria.getEducationWeight();

        // 4. Keywords/Certifications matching (default 15%)
        double keywordScore = calculateKeywordMatch(cvData, criteria.getKeywords());
        score += keywordScore * criteria.getKeywordsWeight();

        return Math.min(score * 100, 100.0); // Scale to 0-100
    }

    /**
     * Calculate skills match score
     */
    private double calculateSkillsMatch(List<String> candidateSkills, List<String> requiredSkills,
            List<String> preferredSkills) {
        if (candidateSkills == null || candidateSkills.isEmpty()) {
            return 0.0;
        }

        Set<String> candSkillsLower = candidateSkills.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        double score = 0.0;

        // Required skills: 70% of skills score
        if (requiredSkills != null && !requiredSkills.isEmpty()) {
            long matchedRequired = requiredSkills.stream()
                    .filter(s -> candSkillsLower.contains(s.toLowerCase()))
                    .count();
            score += 0.7 * ((double) matchedRequired / requiredSkills.size());
        } else {
            score += 0.7; // No required skills = full points
        }

        // Preferred skills: 30% of skills score
        if (preferredSkills != null && !preferredSkills.isEmpty()) {
            long matchedPreferred = preferredSkills.stream()
                    .filter(s -> candSkillsLower.contains(s.toLowerCase()))
                    .count();
            score += 0.3 * ((double) matchedPreferred / preferredSkills.size());
        } else {
            score += 0.3; // No preferred skills = full points
        }

        return score;
    }

    /**
     * Calculate experience match score
     */
    private double calculateExperienceMatch(Integer candidateYears, Integer minimumYears) {
        if (candidateYears == null) {
            return 0.5; // Unknown experience = 50%
        }

        if (minimumYears == null || minimumYears == 0) {
            return 1.0; // No minimum = full points
        }

        if (candidateYears >= minimumYears) {
            // Bonus for extra experience (up to 2x minimum)
            double bonus = Math.min((double) candidateYears / minimumYears, 2.0);
            return Math.min(bonus / 2.0, 1.0);
        } else {
            // Partial credit for some experience
            return (double) candidateYears / minimumYears;
        }
    }

    /**
     * Calculate education match score
     */
    private double calculateEducationMatch(String candidateEducation, List<String> requiredLevels) {
        if (candidateEducation == null || candidateEducation.equals("Unknown")) {
            return 0.5; // Unknown = 50%
        }

        if (requiredLevels == null || requiredLevels.isEmpty()) {
            return 1.0; // No requirement = full points
        }

        // Education hierarchy
        Map<String, Integer> eduRank = Map.of(
                "PhD", 5,
                "Masters", 4,
                "Bachelors", 3,
                "Diploma", 2,
                "Certificate", 1,
                "Unknown", 0);

        int candRank = eduRank.getOrDefault(candidateEducation, 0);

        // Check if candidate meets any required level
        for (String required : requiredLevels) {
            int reqRank = eduRank.getOrDefault(required, 0);
            if (candRank >= reqRank) {
                return 1.0; // Meets or exceeds requirement
            }
        }

        // Partial credit based on how close they are
        int maxReqRank = requiredLevels.stream()
                .mapToInt(r -> eduRank.getOrDefault(r, 0))
                .max()
                .orElse(0);

        return Math.max(0.0, (double) candRank / maxReqRank);
    }

    /**
     * Calculate keyword/certification match score
     */
    private double calculateKeywordMatch(ParsedCVData cvData, List<String> keywords) {
        if (keywords == null || keywords.isEmpty()) {
            return 1.0; // No keywords = full points
        }

        Set<String> candKeywords = new HashSet<>();
        if (cvData.getExtractedSkills() != null) {
            candKeywords.addAll(cvData.getExtractedSkills().stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet()));
        }
        if (cvData.getCertifications() != null) {
            candKeywords.addAll(cvData.getCertifications().stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet()));
        }

        long matches = keywords.stream()
                .filter(k -> candKeywords.contains(k.toLowerCase()))
                .count();

        return (double) matches / keywords.size();
    }

    /**
     * Fallback scoring when CV parsing is not available
     */
    private double computeFallbackScore(Application app, Job job) {
        double score = 0.0;

        // Basic skills matching from application skills field
        List<String> requiredSkills = job.getSkills();
        String applicantSkills = app.getSkillsSummary();

        if (requiredSkills != null && !requiredSkills.isEmpty() && applicantSkills != null) {
            String skillsLower = applicantSkills.toLowerCase();
            int matchCount = 0;

            for (String skill : requiredSkills) {
                if (skillsLower.contains(skill.toLowerCase().trim())) {
                    matchCount++;
                }
            }

            double skillMatchPercent = (double) matchCount / requiredSkills.size();
            score += skillMatchPercent * 50;
        }

        // Application completeness
        if (app.getCvFilename() != null && !app.getCvFilename().isEmpty()) {
            score += 25;
        }
        if (app.getLetterFilename() != null && !app.getLetterFilename().isEmpty()) {
            score += 25;
        }

        return Math.min(score, 100.0);
    }

    /**
     * Build human-readable score explanation
     */
    private String buildScoreReason(Application app, Job job, JobCriteria criteria, ParsedCVData cvData, double score) {
        StringBuilder reason = new StringBuilder();
        reason.append(String.format("Score: %.1f/100. ", score));

        if (cvData == null || cvData.getExtractedSkills().isEmpty()) {
            reason.append("CV parsing unavailable - basic scoring used. ");
            return reason.toString();
        }

        // Skills breakdown
        if (criteria.getRequiredSkills() != null && !criteria.getRequiredSkills().isEmpty()) {
            Set<String> candSkills = cvData.getExtractedSkills().stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());

            List<String> matched = criteria.getRequiredSkills().stream()
                    .filter(s -> candSkills.contains(s.toLowerCase()))
                    .limit(5)
                    .collect(Collectors.toList());

            if (!matched.isEmpty()) {
                reason.append("Matched: ").append(String.join(", ", matched)).append(". ");
            }
        }

        // Experience
        if (cvData.getYearsOfExperience() != null) {
            reason.append(String.format("%d years exp. ", cvData.getYearsOfExperience()));
        }

        // Education
        if (cvData.getEducationLevel() != null && !cvData.getEducationLevel().equals("Unknown")) {
            reason.append(cvData.getEducationLevel()).append(". ");
        }

        return reason.toString();
    }

    /**
     * Create default criteria from job's existing fields
     */
    private JobCriteria createDefaultCriteria(Job job) {
        logger.info("Creating default criteria for job {}", job.getId());

        JobCriteria criteria = new JobCriteria(job);

        // Use job's skills as required skills
        if (job.getSkills() != null && !job.getSkills().isEmpty()) {
            criteria.setRequiredSkills(new ArrayList<>(job.getSkills()));
        }

        // Use job's experience requirement
        if (job.getYearsExperiance() != null) {
            criteria.setMinimumYearsExperience(job.getYearsExperiance());
        }

        // ✨ NEW: Scan description for education requirements
        List<String> detectedEdu = extractEducationFromText(job.getDescription() + " " + job.getTitle());
        if (!detectedEdu.isEmpty()) {
            logger.info("Detected education requirements from text: {}", detectedEdu);
            criteria.setRequiredEducationLevels(detectedEdu);
        }

        return jobCriteriaRepository.save(criteria);
    }

    /**
     * Helper to detect education levels in job description text
     */
    private List<String> extractEducationFromText(String text) {
        if (text == null || text.isEmpty())
            return new ArrayList<>();

        List<String> results = new ArrayList<>();
        String lower = text.toLowerCase();

        if (lower.matches(".*\\b(phd|ph\\.d|doctorate)\\b.*"))
            results.add("PhD");
        if (lower.matches(".*\\b(masters?|msc|m\\.sc|mba)\\b.*"))
            results.add("Masters");
        if (lower.matches(".*\\b(bachelors?|bsc|b\\.sc|undergraduate|degree)\\b.*"))
            results.add("Bachelors");
        if (lower.matches(".*\\b(diploma|hnd)\\b.*"))
            results.add("Diploma");

        return results;
    }

    /**
     * Get only the shortlisted application IDs (top N)
     */
    public List<Long> getShortlistedIds(Long jobId, int topN) {
        return shortlistApplications(jobId, topN).stream()
                .filter(ShortlistResult::isShortlisted)
                .map(ShortlistResult::getApplicationId)
                .collect(Collectors.toList());
    }
}
