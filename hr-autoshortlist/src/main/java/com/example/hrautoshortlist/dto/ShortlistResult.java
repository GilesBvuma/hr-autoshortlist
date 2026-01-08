package com.example.hrautoshortlist.dto;

public class ShortlistResult {
    private Long applicationId;
    private String applicantName;
    private String applicantEmail;
    private double computedScore;
    private boolean shortlisted;
    private String reason;

    public ShortlistResult() {
    }

    public ShortlistResult(Long applicationId, String applicantName, String applicantEmail, double computedScore, boolean shortlisted, String reason) {
        this.applicationId = applicationId;
        this.applicantName = applicantName;
        this.applicantEmail = applicantEmail;
        this.computedScore = computedScore;
        this.shortlisted = shortlisted;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getApplicantEmail() {
        return applicantEmail;
    }

    public void setApplicantEmail(String applicantEmail) {
        this.applicantEmail = applicantEmail;
    }

    public double getComputedScore() {
        return computedScore;
    }

    public void setComputedScore(double computedScore) {
        this.computedScore = computedScore;
    }

    public boolean isShortlisted() {
        return shortlisted;
    }

    public void setShortlisted(boolean shortlisted) {
        this.shortlisted = shortlisted;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
