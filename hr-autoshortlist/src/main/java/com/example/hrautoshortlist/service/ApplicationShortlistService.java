package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.dto.ShortlistResult;
import com.example.hrautoshortlist.entity.Application;
import com.example.hrautoshortlist.entity.Job;
import com.example.hrautoshortlist.repository.ApplicationRepository;
import com.example.hrautoshortlist.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI-powered shortlisting service for job applications.
 * Scores applicants based on skills matching with job requirements.
 */
@Service
public class ApplicationShortlistService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    public ApplicationShortlistService(ApplicationRepository applicationRepository, JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
    }

    /**
     * Compute a score for an application based on how well it matches job
     * requirements.
     * Scoring factors:
     * - Skills matching: How many required skills does the applicant have?
     * - Keyword density: How relevant is the skills summary?
     * - Completeness: Did they upload CV and cover letter?
     */
    public double computeApplicationScore(Application app, Job job) {
        double score = 0.0;
        StringBuilder matchDetails = new StringBuilder();

        // 1. SKILLS MATCHING (max 50 points)
        List<String> requiredSkills = job.getSkills();
        String applicantSkills = app.getSkillsSummary();

        if (requiredSkills != null && !requiredSkills.isEmpty() && applicantSkills != null) {
            String skillsLower = applicantSkills.toLowerCase();
            int matchCount = 0;
            List<String> matchedSkills = new ArrayList<>();

            for (String skill : requiredSkills) {
                String skillLower = skill.toLowerCase().trim();
                // Check if skill appears in applicant's summary (flexible matching)
                if (skillsLower.contains(skillLower)) {
                    matchCount++;
                    matchedSkills.add(skill);
                }
            }

            // Calculate percentage match, scale to 50 points
            double skillMatchPercent = (double) matchCount / requiredSkills.size();
            score += skillMatchPercent * 50;
            matchDetails.append(String.format("Skills: %d/%d matched (%s). ",
                    matchCount, requiredSkills.size(), String.join(", ", matchedSkills)));
        } else {
            matchDetails.append("No skills to match. ");
        }

        // 2. KEYWORD RELEVANCE (max 25 points)
        // Check if job title keywords appear in skills summary
        if (applicantSkills != null && job.getTitle() != null) {
            String[] titleWords = job.getTitle().toLowerCase().split("\\s+");
            String skillsLower = applicantSkills.toLowerCase();
            int keywordMatches = 0;

            for (String word : titleWords) {
                if (word.length() > 3 && skillsLower.contains(word)) {
                    keywordMatches++;
                }
            }
            score += Math.min(keywordMatches * 5, 25);
            matchDetails.append(String.format("Keywords: %d matches. ", keywordMatches));
        }

        // 3. EXPERIENCE INDICATORS (max 15 points)
        // Look for experience-related keywords in skills summary
        if (applicantSkills != null) {
            String skillsLower = applicantSkills.toLowerCase();

            // Years of experience mentions
            if (skillsLower.matches(".*\\d+\\s*\\+?\\s*years?.*")) {
                score += 10;
                matchDetails.append("Experience mentioned. ");
            }

            // Senior/Lead/Expert keywords
            if (skillsLower.contains("senior") || skillsLower.contains("lead") ||
                    skillsLower.contains("expert") || skillsLower.contains("advanced")) {
                score += 5;
                matchDetails.append("Senior-level indicators. ");
            }
        }

        // 4. APPLICATION COMPLETENESS (max 10 points)
        if (app.getCvFilename() != null && !app.getCvFilename().isEmpty()) {
            score += 5;
            matchDetails.append("CV uploaded. ");
        }
        if (app.getLetterFilename() != null && !app.getLetterFilename().isEmpty()) {
            score += 5;
            matchDetails.append("Cover letter uploaded. ");
        }

        // Cap at 100
        score = Math.min(score, 100);

        return Math.round(score * 100.0) / 100.0;
    }

    /**
     * Shortlist top N applications for a job based on computed scores.
     */
    public List<ShortlistResult> shortlistApplications(Long jobId, int topN) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));

        List<Application> applications = applicationRepository.findByJob_Id(jobId);

        List<ShortlistResult> results = new ArrayList<>();

        for (Application app : applications) {
            double score = computeApplicationScore(app, job);

            // FIXED: Use getCandidateUser() instead of getApplicant()
            String applicantName = app.getCandidateUser() != null ? app.getCandidateUser().getFullName() : "Unknown";
            String applicantEmail = app.getCandidateUser() != null ? app.getCandidateUser().getEmail() : "";

            // Build reason string
            String reason = buildScoreReason(app, job, score);

            results.add(new ShortlistResult(
                    app.getId(),
                    applicantName,
                    applicantEmail,
                    score,
                    false, // Will set shortlisted flag below
                    reason));
        }

        // Sort by score descending
        results.sort(Comparator.comparingDouble(ShortlistResult::getComputedScore).reversed());

        // Mark top N as shortlisted
        for (int i = 0; i < Math.min(topN, results.size()); i++) {
            results.get(i).setShortlisted(true);
        }

        return results;
    }

    /**
     * Get only the shortlisted application IDs (top N)
     */
    public List<Long> getShortlistedIds(Long jobId, int topN) {
        return shortlistApplications(jobId, topN).stream()
                .filter(ShortlistResult::isShortlisted)
                .map(ShortlistResult::getId)
                .collect(Collectors.toList());
    }

    /**
     * Build a human-readable explanation of the score
     */
    private String buildScoreReason(Application app, Job job, double score) {
        StringBuilder reason = new StringBuilder();
        reason.append(String.format("Score: %.1f/100. ", score));

        List<String> requiredSkills = job.getSkills();
        String applicantSkills = app.getSkillsSummary();

        if (requiredSkills != null && applicantSkills != null) {
            String skillsLower = applicantSkills.toLowerCase();
            List<String> matched = requiredSkills.stream()
                    .filter(s -> skillsLower.contains(s.toLowerCase().trim()))
                    .collect(Collectors.toList());

            if (!matched.isEmpty()) {
                reason.append("Matched skills: ").append(String.join(", ", matched)).append(". ");
            }

            List<String> missing = requiredSkills.stream()
                    .filter(s -> !skillsLower.contains(s.toLowerCase().trim()))
                    .collect(Collectors.toList());

            if (!missing.isEmpty()) {
                reason.append("Missing: ").append(String.join(", ", missing)).append(".");
            }
        }

        return reason.toString();
    }
}
