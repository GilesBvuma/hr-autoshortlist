package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.dto.CandidateMatch;
import com.example.hrautoshortlist.dto.GeminiRequest;
import com.example.hrautoshortlist.dto.GeminiResponse;
import com.example.hrautoshortlist.dto.ParsedCVData;
import com.example.hrautoshortlist.entity.Application;
import com.example.hrautoshortlist.entity.Job;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for communicating with the Google Gemini AI API.
 *
 * Responsibilities:
 * - Build structured prompts from job + candidate data
 * - Send requests to Gemini 1.5 Flash (free tier)
 * - Parse JSON responses into CandidateMatch objects
 * - Handle rate limits and errors gracefully with fallbacks
 */
@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    // Gemini free-tier limit: 15 RPM / 1 million TPM. We batch all candidates
    // in ONE request to stay well within limits.
    private static final int MAX_CV_TEXT_CHARS = 800; // Truncate raw CV text per candidate
    private static final int MAX_CANDIDATES_PER_BATCH = 20; // Safety guard for huge applicant pools

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String apiUrl;

    public GeminiService(
            @Qualifier("geminiRestTemplate") RestTemplate restTemplate,
            @Qualifier("geminiApiKey") String apiKey,
            @Qualifier("geminiApiUrl") String apiUrl) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;

        // ── Startup diagnostics ──
        String maskedKey = (apiKey != null && apiKey.length() > 8)
                ? apiKey.substring(0, 8) + "..."
                : "MISSING";
        logger.info("╔══════════════════════════════════════════════╗");
        logger.info("║ GeminiService initialized                    ║");
        logger.info("║ API URL : {}  ", apiUrl);
        logger.info("║ API Key : {}  ", maskedKey);
        logger.info("╚══════════════════════════════════════════════╝");
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    /**
     * Main entry point: sends a batch of candidates + job details to Gemini
     * and returns a scored {@link CandidateMatch} for each.
     *
     * If the Gemini call fails for any reason, falls back gracefully so that
     * the rest of the shortlisting pipeline can continue with rule-based scores.
     *
     * @param job          The job posting with requirements
     * @param applications The list of applications to score
     * @param cvDataMap    Map of applicationId → ParsedCVData (may be null entries)
     * @return List of CandidateMatch objects, one per application
     */
    public List<CandidateMatch> scoreApplications(
            Job job,
            List<Application> applications,
            Map<Long, ParsedCVData> cvDataMap) {

        logger.info("Scoring {} applications via Gemini AI for job '{}'",
                applications.size(), job.getTitle());

        List<CandidateMatch> results = new ArrayList<>();

        // Process in batches to respect context-window limits
        List<List<Application>> batches = partition(applications, MAX_CANDIDATES_PER_BATCH);

        for (int batchIndex = 0; batchIndex < batches.size(); batchIndex++) {
            List<Application> batch = batches.get(batchIndex);
            logger.info("Processing batch {}/{} ({} candidates)", batchIndex + 1, batches.size(), batch.size());

            try {
                List<CandidateMatch> batchResults = scoreBatch(job, batch, cvDataMap);
                results.addAll(batchResults);

                // Polite delay between batches to respect rate limits
                if (batchIndex < batches.size() - 1) {
                    Thread.sleep(2000);
                }
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                logger.warn("Batch processing interrupted");
                addFallbackResults(batch, results, "Processing interrupted");
            } catch (Exception e) {
                logger.error("Gemini batch {} failed: {}", batchIndex + 1, e.getMessage());
                String errorMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
                addFallbackResults(batch, results, "Gemini API failure: " + errorMsg);
            }
        }

        return results;
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Scores a single batch of applications in one Gemini API call.
     */
    private List<CandidateMatch> scoreBatch(
            Job job,
            List<Application> batch,
            Map<Long, ParsedCVData> cvDataMap) {

        String prompt = buildPrompt(job, batch, cvDataMap);
        String rawResponse = callGeminiApi(prompt);

        if (rawResponse == null) {
            List<CandidateMatch> fallbacks = new ArrayList<>();
            addFallbackResults(batch, fallbacks, "No response from Gemini");
            return fallbacks;
        }

        return parseGeminiResponse(rawResponse, batch);
    }

    /**
     * Builds a structured prompt asking Gemini to score each candidate.
     *
     * The prompt asks for a strict JSON array so we can parse it reliably.
     */
    private String buildPrompt(Job job, List<Application> applications, Map<Long, ParsedCVData> cvDataMap) {
        StringBuilder sb = new StringBuilder();

        // --- System instructions ---
        sb.append("You are an expert HR recruitment assistant. Your task is to evaluate job applicants ")
                .append("and return a JSON array with a match score and short reasoning for each candidate.\n\n");

        // --- Job details ---
        sb.append("=== JOB DETAILS ===\n");
        sb.append("Title: ").append(job.getTitle()).append("\n");
        sb.append("Department: ").append(job.getDepartment()).append("\n");
        sb.append("Description: ").append(truncate(job.getDescription(), 1200)).append("\n");
        sb.append("Required Qualifications: ").append(job.getRequiredQualifications()).append("\n");
        sb.append("Minimum Experience (years): ").append(job.getYearsExperiance()).append("\n");

        if (job.getSkills() != null && !job.getSkills().isEmpty()) {
            sb.append("Required Skills: ").append(String.join(", ", job.getSkills())).append("\n");
        }
        sb.append("\n");

        // --- Candidate summaries ---
        sb.append("=== CANDIDATES ===\n");
        for (Application app : applications) {
            sb.append("---\n");
            sb.append("Application ID: ").append(app.getId()).append("\n");

            String name = app.getCandidateUser() != null ? app.getCandidateUser().getFullName() : "Unknown";
            sb.append("Name: ").append(name).append("\n");
            sb.append("Self-reported skills: ").append(app.getSkillsSummary() != null ? app.getSkillsSummary() : "None")
                    .append("\n");

            ParsedCVData cvData = cvDataMap != null ? cvDataMap.get(app.getId()) : null;
            if (cvData != null) {
                if (cvData.getYearsOfExperience() != null) {
                    sb.append("Years of experience (CV): ").append(cvData.getYearsOfExperience()).append("\n");
                }
                if (cvData.getEducationLevel() != null) {
                    sb.append("Education level (CV): ").append(cvData.getEducationLevel()).append("\n");
                }
                if (cvData.getExtractedSkills() != null && !cvData.getExtractedSkills().isEmpty()) {
                    sb.append("Extracted skills (CV): ").append(String.join(", ", cvData.getExtractedSkills()))
                            .append("\n");
                }
                if (cvData.getCertifications() != null && !cvData.getCertifications().isEmpty()) {
                    sb.append("Certifications: ").append(String.join(", ", cvData.getCertifications())).append("\n");
                }
                if (cvData.getRawText() != null && !cvData.getRawText().isBlank()) {
                    sb.append("CV excerpt: ").append(truncate(cvData.getRawText(), MAX_CV_TEXT_CHARS)).append("\n");
                }
            }
            sb.append("\n");
        }

        // --- Output instructions ---
        sb.append("=== INSTRUCTIONS ===\n");
        sb.append("Return ONLY a valid JSON array. No markdown, no explanation outside the JSON.\n");
        sb.append("Each element must have exactly these fields:\n");
        sb.append("  - applicationId (number): the Application ID from above\n");
        sb.append("  - score (number): match score from 0 to 100 (higher = better fit)\n");
        sb.append("  - reasoning (string): 1-2 sentence explanation of the score\n\n");
        sb.append("Example format:\n");
        sb.append("[\n");
        sb.append(
                "  {\"applicationId\": 42, \"score\": 87, \"reasoning\": \"Strong Java and Spring Boot skills match the role. Exceeds experience requirement.\"},\n");
        sb.append(
                "  {\"applicationId\": 43, \"score\": 54, \"reasoning\": \"Partial skills match; lacks required cloud experience.\"}\n");
        sb.append("]\n");

        return sb.toString();
    }

    /**
     * Calls the Gemini REST API and returns the raw text response.
     * Returns null on any HTTP error or connectivity issue.
     */
    private String callGeminiApi(String prompt) {
        String url = apiUrl + "?key=" + apiKey;

        logger.info("▶ Calling Gemini API: {} (prompt length: {} chars)", apiUrl, prompt.length());

        // Build the request body
        GeminiRequest.Part part = new GeminiRequest.Part(prompt);
        GeminiRequest.Content content = new GeminiRequest.Content(List.of(part));
        GeminiRequest request = new GeminiRequest(List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<GeminiResponse> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, GeminiResponse.class);

            logger.info("✅ Gemini response status: {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String text = response.getBody().getFirstText();
                logger.info("✅ Gemini returned text ({} chars)",
                        text != null ? text.length() : 0);
                return text;
            }

            logger.warn("⚠ Gemini returned non-2xx status: {}", response.getStatusCode());
            return null;

        } catch (HttpClientErrorException e) {
            logger.error("❌ Gemini HTTP error {}: {}",
                    e.getStatusCode().value(), e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            logger.error("❌ Gemini API call failed: {} ({})",
                    e.getMessage(), e.getClass().getSimpleName());
            return null;
        }
    }

    /**
     * Parses Gemini's JSON array response into CandidateMatch objects.
     * Falls back gracefully for any candidate not found in the response.
     */
    private List<CandidateMatch> parseGeminiResponse(String rawResponse, List<Application> batch) {
        List<CandidateMatch> results = new ArrayList<>();

        // Build a lookup of applicationId → Application for quick matching
        Map<Long, Application> appMap = new HashMap<>();
        for (Application app : batch) {
            appMap.put(app.getId(), app);
        }

        try {
            // Strip potential markdown code fences from Gemini output
            String cleaned = rawResponse.trim();
            if (cleaned.startsWith("```")) {
                int start = cleaned.indexOf('\n') + 1;
                int end = cleaned.lastIndexOf("```");
                cleaned = (end > start) ? cleaned.substring(start, end).trim() : cleaned.substring(start).trim();
            }

            JsonArray jsonArray = JsonParser.parseString(cleaned).getAsJsonArray();

            for (JsonElement element : jsonArray) {
                try {
                    JsonObject obj = element.getAsJsonObject();
                    long appId = obj.get("applicationId").getAsLong();
                    double score = Math.min(100.0, Math.max(0.0, obj.get("score").getAsDouble()));
                    String reasoning = obj.has("reasoning") ? obj.get("reasoning").getAsString() : "AI scored.";

                    if (appMap.containsKey(appId)) {
                        results.add(new CandidateMatch(appId, score, reasoning, true));
                        appMap.remove(appId); // Mark as processed
                        logger.debug("Parsed AI score for app {}: {}", appId, score);
                    }
                } catch (Exception entryEx) {
                    logger.warn("Could not parse one Gemini result entry: {}", entryEx.getMessage());
                }
            }

        } catch (Exception e) {
            logger.error("Failed to parse Gemini JSON response: {}", e.getMessage());
            logger.debug("Raw response was: {}", rawResponse);
        }

        // Any candidates not returned by Gemini get a fallback score
        for (Long remainingId : appMap.keySet()) {
            results.add(new CandidateMatch(remainingId, 50.0, "AI scoring incomplete – default score applied.", false));
        }

        return results;
    }

    /**
     * Adds fallback CandidateMatch entries for a batch when Gemini fails entirely.
     */
    private void addFallbackResults(List<Application> batch, List<CandidateMatch> results, String reason) {
        for (Application app : batch) {
            results.add(new CandidateMatch(app.getId(), 50.0, reason, false));
        }
    }

    /**
     * Splits a list into sub-lists of the given size.
     */
    private <T> List<List<T>> partition(List<T> list, int size) {
        List<List<T>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            partitions.add(list.subList(i, Math.min(i + size, list.size())));
        }
        return partitions;
    }

    /**
     * Truncates a string to maxLen characters, adding an ellipsis if needed.
     */
    private String truncate(String text, int maxLen) {
        if (text == null)
            return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "...";
    }
}
