package com.example.hrautoshortlist.dto;

public class ApplicationResponseDTO {
    private Long id;
    private String fullname;
    private String email;
    private String phone;
    private String skillsSummary;
    private String cvDownloadUrl; // safe URL for frontend
    private String letterDownloadUrl; // safe URL for frontend
    private Long jobId;

    public ApplicationResponseDTO() {
    }

    public ApplicationResponseDTO(Long id, String fullname, String email, String phone,
            String skillsSummary, String cvDownloadUrl, String letterDownloadUrl, Long jobId) {
        this.id = id;
        this.fullname = fullname;
        this.email = email;
        this.phone = phone;
        this.skillsSummary = skillsSummary;
        this.cvDownloadUrl = cvDownloadUrl;
        this.letterDownloadUrl = letterDownloadUrl;
        this.jobId = jobId;
    }

    // getters / setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSkillsSummary() {
        return skillsSummary;
    }

    public void setSkillsSummary(String skillsSummary) {
        this.skillsSummary = skillsSummary;
    }

    public String getCvDownloadUrl() {
        return cvDownloadUrl;
    }

    public void setCvDownloadUrl(String cvDownloadUrl) {
        this.cvDownloadUrl = cvDownloadUrl;
    }

    public String getLetterDownloadUrl() {
        return letterDownloadUrl;
    }

    public void setLetterDownloadUrl(String letterDownloadUrl) {
        this.letterDownloadUrl = letterDownloadUrl;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }
}
