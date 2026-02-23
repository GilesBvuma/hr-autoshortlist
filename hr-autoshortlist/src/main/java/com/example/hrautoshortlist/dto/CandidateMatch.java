package com.example.hrautoshortlist.dto;

/**
 * DTO representing the AI-generated match result for a single candidate.
 * Gemini returns a score (0-100) and a reasoning string for each applicant.
 */
public class CandidateMatch {

    private Long applicationId;
    private double matchScore; // 0–100 scale
    private String reasoning; // Human-readable explanation from Gemini
    private boolean aiScored; // true = AI scored; false = fallback used

    public CandidateMatch() {
    }

    public CandidateMatch(Long applicationId, double matchScore, String reasoning, boolean aiScored) {
        this.applicationId = applicationId;
        this.matchScore = matchScore;
        this.reasoning = reasoning;
        this.aiScored = aiScored;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(double matchScore) {
        this.matchScore = matchScore;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public boolean isAiScored() {
        return aiScored;
    }

    public void setAiScored(boolean aiScored) {
        this.aiScored = aiScored;
    }

    @Override
    public String toString() {
        return "CandidateMatch{applicationId=" + applicationId +
                ", matchScore=" + matchScore +
                ", aiScored=" + aiScored + '}';
    }
}