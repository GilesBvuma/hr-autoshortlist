package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.dto.CandidateMatch;
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
 * AI-powered shortlisting service.
 *
 * Scoring pipeline:
 * 1. Parse each candidate's CV (Apache Tika)
 * 2. Send job + all parsed CVs to Gemini AI in one batch call
 * 3. Merge AI scores with rule-based scores (weighted blend)
 * 4. Rank candidates and persist the top-N as shortlisted
 *
 * If Gemini is unavailable, the service gracefully falls back to the
 * existing rule-based scoring so shortlisting always completes.
 */
@Service
public class ApplicationShortlistService {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationShortlistService.class);

    // Weight given to the Gemini AI score vs the rule-based score (must sum to 1.0)
    private static final double AI_SCORE_WEIGHT = 0.65;
    private static final double RULE_SCORE_WEIGHT = 0.35;

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final JobCriteriaRepository jobCriteriaRepository;
    private final CVParsingService cvParsingService;
    private final GeminiService geminiService;

    public ApplicationShortlistService(
            ApplicationRepository applicationRepository,
            JobRepository jobRepository,
            JobCriteriaRepository jobCriteriaRepository,
            CVParsingService cvParsingService,
            GeminiService geminiService) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.jobCriteriaRepository = jobCriteriaRepository;
        this.cvParsingService = cvParsingService;
        this.geminiService = geminiService;
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    /**
     * Shortlist the top-N applications for a job using AI + rule-based scoring.
     *
     * @param jobId The job to shortlist for
     * @param topN  How many candidates to mark as shortlisted
     * @return Full ranked list of ShortlistResult (all candidates, not just top-N)
     */
    public List<ShortlistResult> shortlistApplications(Long jobId, int topN) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));

        List<Application> applications = applicationRepository.findByJob_Id(jobId);
        logger.info("Shortlisting {} applications for job '{}', selecting top {}",
                applications.size(), job.getTitle(), topN);

        // STEP 1 – Reset previous shortlist flags
        resetShortlistFlags(applications);

        // STEP 2 – Get or create rule-based job criteria
        JobCriteria criteria = jobCriteriaRepository.findByJobId(jobId)
                .orElseGet(() -> createDefaultCriteria(job));

        // STEP 3 – Parse CVs for all applications (force-refresh so latest logic
        // applies)
        Map<Long, ParsedCVData> cvDataMap = parseCVsForAllApplications(applications);

        // STEP 4 – Get AI scores from Gemini (one batch call for all candidates)
        Map<Long, CandidateMatch> aiScoreMap = getAIScores(job, applications, cvDataMap);

        // STEP 5 – Compute final blended score for each application
        List<ShortlistResult> results = new ArrayList<>();
        for (Application app : applications) {
            try {
                ParsedCVData cvData = cvDataMap.get(app.getId());
                CandidateMatch aiMatch = aiScoreMap.get(app.getId());

                double ruleScore = computeRuleBasedScore(app, job, criteria, cvData);
                double finalScore = blendScores(ruleScore, aiMatch);

                String name = app.getCandidateUser() != null ? app.getCandidateUser().getFullName() : "Unknown";
                String email = app.getCandidateUser() != null ? app.getCandidateUser().getEmail() : "";
                String reason = buildReason(app, job, criteria, cvData, aiMatch, finalScore);

                results.add(new ShortlistResult(app.getId(), name, email, finalScore, false, reason));

            } catch (Exception e) {
                logger.error("Error computing final score for application {}", app.getId(), e);
                String name = app.getCandidateUser() != null ? app.getCandidateUser().getFullName() : "Unknown";
                String email = app.getCandidateUser() != null ? app.getCandidateUser().getEmail() : "";
                results.add(new ShortlistResult(app.getId(), name, email, 0.0, false,
                        "Scoring error: " + e.getMessage()));
            }
        }

        // STEP 6 – Sort descending and mark top-N
        results.sort(Comparator.comparingDouble(ShortlistResult::getComputedScore).reversed());
        markTopN(results, topN);

        logger.info("Shortlisting complete. Top score: {}",
                results.isEmpty() ? 0 : String.format("%.1f", results.get(0).getComputedScore()));

        return results;
    }

    /**
     * Returns only the shortlisted application IDs (convenience wrapper).
     */
    public List<Long> getShortlistedIds(Long jobId, int topN) {
        return shortlistApplications(jobId, topN).stream()
                .filter(ShortlistResult::isShortlisted)
                .map(ShortlistResult::getApplicationId)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // PRIVATE PIPELINE STEPS
    // =========================================================================

    /** Clears shortlist flags from the previous run. */
    private void resetShortlistFlags(List<Application> applications) {
        for (Application app : applications) {
            if (app.isShortlisted()) {
                app.setShortlisted(false);
                applicationRepository.save(app);
            }
        }
    }

    /**
     * Parses CVs for every application and returns a map: applicationId →
     * ParsedCVData.
     */
    private Map<Long, ParsedCVData> parseCVsForAllApplications(List<Application> applications) {
        Map<Long, ParsedCVData> cvDataMap = new HashMap<>();
        for (Application app : applications) {
            try {
                cvParsingService.parseAndSaveCV(app, true); // Force-refresh
                ParsedCVData data = cvParsingService.getParsedCVData(app.getId());
                cvDataMap.put(app.getId(), data);
            } catch (Exception e) {
                logger.warn("CV parsing failed for application {}: {}", app.getId(), e.getMessage());
                cvDataMap.put(app.getId(), null);
            }
        }
        return cvDataMap;
    }

    /**
     * Calls GeminiService to get AI scores, then converts the result list into
     * a map keyed by applicationId for easy lookup.
     */
    private Map<Long, CandidateMatch> getAIScores(
            Job job,
            List<Application> applications,
            Map<Long, ParsedCVData> cvDataMap) {

        Map<Long, CandidateMatch> aiScoreMap = new HashMap<>();
        try {
            List<CandidateMatch> aiMatches = geminiService.scoreApplications(job, applications, cvDataMap);
            for (CandidateMatch match : aiMatches) {
                aiScoreMap.put(match.getApplicationId(), match);
            }
            logger.info("Received {} AI scores from Gemini", aiMatches.size());
        } catch (Exception e) {
            logger.error("GeminiService failed entirely; falling back to rule-based only: {}", e.getMessage());
            // aiScoreMap stays empty → blendScores will use rule-based only
        }
        return aiScoreMap;
    }

    /**
     * Blends the rule-based score with the AI score.
     * If no AI score is available, uses the rule-based score at 100%.
     */
    private double blendScores(double ruleScore, CandidateMatch aiMatch) {
        if (aiMatch == null || !aiMatch.isAiScored()) {
            // No valid AI score → rule-based only
            return Math.min(ruleScore, 100.0);
        }
        double blended = (aiMatch.getMatchScore() * AI_SCORE_WEIGHT) + (ruleScore * RULE_SCORE_WEIGHT);
        return Math.min(blended, 100.0);
    }

    /** Persists shortlisted=true on the top-N results in the database. */
    private void markTopN(List<ShortlistResult> sortedResults, int topN) {
        for (int i = 0; i < Math.min(topN, sortedResults.size()); i++) {
            ShortlistResult result = sortedResults.get(i);
            result.setShortlisted(true);
            applicationRepository.findById(result.getApplicationId()).ifPresent(app -> {
                app.setShortlisted(true);
                applicationRepository.save(app);
            });
        }
    }

    // =========================================================================
    // RULE-BASED SCORING (unchanged from original, kept as safety net)
    // =========================================================================

    private double computeRuleBasedScore(Application app, Job job, JobCriteria criteria, ParsedCVData cvData) {
        if (cvData == null || cvData.getExtractedSkills().isEmpty()) {
            return computeFallbackScore(app, job);
        }

        double score = 0.0;
        score += calculateSkillsMatch(cvData.getExtractedSkills(), criteria.getRequiredSkills(),
                criteria.getPreferredSkills()) * criteria.getSkillsWeight();
        score += calculateExperienceMatch(cvData.getYearsOfExperience(), criteria.getMinimumYearsExperience())
                * criteria.getExperienceWeight();
        score += calculateEducationMatch(cvData.getEducationLevel(), criteria.getRequiredEducationLevels())
                * criteria.getEducationWeight();
        score += calculateKeywordMatch(cvData, criteria.getKeywords()) * criteria.getKeywordsWeight();

        return Math.min(score * 100, 100.0);
    }

    private double calculateSkillsMatch(List<String> candidateSkills, List<String> requiredSkills,
            List<String> preferredSkills) {
        if (candidateSkills == null || candidateSkills.isEmpty())
            return 0.0;
        Set<String> candSkillsLower = candidateSkills.stream().map(String::toLowerCase).collect(Collectors.toSet());
        double score = 0.0;

        if (requiredSkills != null && !requiredSkills.isEmpty()) {
            long matched = requiredSkills.stream().filter(s -> candSkillsLower.contains(s.toLowerCase())).count();
            score += 0.7 * ((double) matched / requiredSkills.size());
        } else {
            score += 0.7;
        }
        if (preferredSkills != null && !preferredSkills.isEmpty()) {
            long matched = preferredSkills.stream().filter(s -> candSkillsLower.contains(s.toLowerCase())).count();
            score += 0.3 * ((double) matched / preferredSkills.size());
        } else {
            score += 0.3;
        }
        return score;
    }

    private double calculateExperienceMatch(Integer candidateYears, Integer minimumYears) {
        if (candidateYears == null)
            return 0.5;
        if (minimumYears == null || minimumYears == 0)
            return 1.0;
        if (candidateYears >= minimumYears) {
            return Math.min((double) candidateYears / minimumYears, 2.0) / 2.0;
        }
        return (double) candidateYears / minimumYears;
    }

    private double calculateEducationMatch(String candidateEducation, List<String> requiredLevels) {
        if (candidateEducation == null || candidateEducation.equals("Unknown"))
            return 0.5;
        if (requiredLevels == null || requiredLevels.isEmpty())
            return 1.0;

        Map<String, Integer> eduRank = Map.of(
                "PhD", 5, "Masters", 4, "Bachelors", 3,
                "Diploma", 2, "Certificate", 1, "Unknown", 0);

        int candRank = eduRank.getOrDefault(candidateEducation, 0);
        for (String required : requiredLevels) {
            if (candRank >= eduRank.getOrDefault(required, 0))
                return 1.0;
        }
        int maxReqRank = requiredLevels.stream().mapToInt(r -> eduRank.getOrDefault(r, 0)).max().orElse(0);
        return maxReqRank > 0 ? Math.max(0.0, (double) candRank / maxReqRank) : 0.0;
    }

    private double calculateKeywordMatch(ParsedCVData cvData, List<String> keywords) {
        if (keywords == null || keywords.isEmpty())
            return 1.0;
        Set<String> candKeywords = new HashSet<>();
        if (cvData.getExtractedSkills() != null) {
            candKeywords
                    .addAll(cvData.getExtractedSkills().stream().map(String::toLowerCase).collect(Collectors.toSet()));
        }
        if (cvData.getCertifications() != null) {
            candKeywords
                    .addAll(cvData.getCertifications().stream().map(String::toLowerCase).collect(Collectors.toSet()));
        }
        long matches = keywords.stream().filter(k -> candKeywords.contains(k.toLowerCase())).count();
        return (double) matches / keywords.size();
    }

    private double computeFallbackScore(Application app, Job job) {
        double score = 0.0;
        List<String> requiredSkills = job.getSkills();
        String applicantSkills = app.getSkillsSummary();
        if (requiredSkills != null && !requiredSkills.isEmpty() && applicantSkills != null) {
            String skillsLower = applicantSkills.toLowerCase();
            long matchCount = requiredSkills.stream().filter(s -> skillsLower.contains(s.toLowerCase().trim())).count();
            score += ((double) matchCount / requiredSkills.size()) * 50;
        }
        if (app.getCvFilename() != null && !app.getCvFilename().isEmpty())
            score += 25;
        if (app.getLetterFilename() != null && !app.getLetterFilename().isEmpty())
            score += 25;
        return Math.min(score, 100.0);
    }

    // =========================================================================
    // REASON BUILDER
    // =========================================================================

    private String buildReason(Application app, Job job, JobCriteria criteria,
            ParsedCVData cvData, CandidateMatch aiMatch, double finalScore) {
        StringBuilder reason = new StringBuilder();
        reason.append(String.format("Score: %.1f/100. ", finalScore));

        // AI reasoning (highest value — show first)
        if (aiMatch != null && aiMatch.getReasoning() != null) {
            if (aiMatch.isAiScored()) {
                reason.append("AI: ").append(aiMatch.getReasoning()).append(" ");
            } else {
                reason.append("AI (fallback): ").append(aiMatch.getReasoning()).append(" ");
            }
        } else {
            reason.append("AI scoring unavailable – rule-based fallback used. ");
        }

        if (cvData != null && !cvData.getExtractedSkills().isEmpty()) {
            // Matched required skills
            if (criteria.getRequiredSkills() != null && !criteria.getRequiredSkills().isEmpty()) {
                Set<String> candSkills = cvData.getExtractedSkills().stream()
                        .map(String::toLowerCase).collect(Collectors.toSet());
                List<String> matched = criteria.getRequiredSkills().stream()
                        .filter(s -> candSkills.contains(s.toLowerCase()))
                        .limit(5).collect(Collectors.toList());
                if (!matched.isEmpty()) {
                    reason.append("Matched skills: ").append(String.join(", ", matched)).append(". ");
                }
            }
            if (cvData.getYearsOfExperience() != null) {
                reason.append(cvData.getYearsOfExperience()).append(" yrs exp. ");
            }
            if (cvData.getEducationLevel() != null && !cvData.getEducationLevel().equals("Unknown")) {
                reason.append(cvData.getEducationLevel()).append(". ");
            }
        }

        return reason.toString().trim();
    }

    // =========================================================================
    // DEFAULT CRITERIA CREATION
    // =========================================================================

    private JobCriteria createDefaultCriteria(Job job) {
        logger.info("Creating default criteria for job {}", job.getId());
        JobCriteria criteria = new JobCriteria(job);
        if (job.getSkills() != null && !job.getSkills().isEmpty()) {
            criteria.setRequiredSkills(new ArrayList<>(job.getSkills()));
        }
        if (job.getYearsExperiance() != null) {
            criteria.setMinimumYearsExperience(job.getYearsExperiance());
        }
        List<String> detectedEdu = extractEducationFromText(
                (job.getDescription() != null ? job.getDescription() : "") + " " + job.getTitle());
        if (!detectedEdu.isEmpty()) {
            criteria.setRequiredEducationLevels(detectedEdu);
        }
        return jobCriteriaRepository.save(criteria);
    }

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
}