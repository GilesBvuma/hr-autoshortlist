package com.example.hrautoshortlist.dto;

public class ShortlistResult {
    private Long id;
    private String fullName;
    private String email;
    private double computedScore;
    private boolean shortlisted;
    private String reason; // short explanation

    public ShortlistResult() {
    }

    public ShortlistResult(Long id, String fullName, String email, double computedScore, boolean shortlisted,
            String reason) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.computedScore = computedScore;
        this.shortlisted = shortlisted;
        this.reason = reason;
    }

    // getters & setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
