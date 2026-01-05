package com.example.hrautoshortlist.dto;

public class ShortlistResult {
    private Long id;
    private String name;
    private String email;
    private double computedScore;
    private boolean shortlisted;
    private String reason;

    public ShortlistResult() {
    }

    public ShortlistResult(Long id, String name, String email, double computedScore, boolean shortlisted,
            String reason) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.computedScore = computedScore;
        this.shortlisted = shortlisted;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
