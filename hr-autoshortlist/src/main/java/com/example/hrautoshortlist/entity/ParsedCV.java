package com.example.hrautoshortlist.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ParsedCV stores structured data extracted from a candidate's CV file.
 * This enables intelligent matching and scoring without re-parsing.
 */
@Entity
@Table(name = "parsed_cvs")
public class ParsedCV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "application_id", unique = true)
    private Application application;

    // Extracted skills from CV
    @ElementCollection
    @CollectionTable(name = "parsed_cv_skills", joinColumns = @JoinColumn(name = "parsed_cv_id"))
    @Column(name = "skill")
    private List<String> extractedSkills = new ArrayList<>();

    // Years of experience mentioned in CV
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    // Highest education level (e.g., "PhD", "Masters", "Bachelors", "Diploma")
    @Column(name = "education_level")
    private String educationLevel;

    // Certifications mentioned in CV
    @ElementCollection
    @CollectionTable(name = "parsed_cv_certifications", joinColumns = @JoinColumn(name = "parsed_cv_id"))
    @Column(name = "certification")
    private List<String> certifications = new ArrayList<>();

    // Raw extracted text (for debugging and review)
    @Column(columnDefinition = "TEXT")
    private String rawText;

    // When the CV was parsed
    @Column(name = "parsed_at")
    private LocalDateTime parsedAt;

    // Parsing status and errors
    @Column(name = "parsing_status")
    private String parsingStatus = "SUCCESS"; // SUCCESS, FAILED, PARTIAL

    @Column(name = "parsing_error", length = 1000)
    private String parsingError;

    @PrePersist
    protected void onCreate() {
        if (parsedAt == null) {
            parsedAt = LocalDateTime.now();
        }
    }

    // Constructors
    public ParsedCV() {
    }

    public ParsedCV(Application application) {
        this.application = application;
        this.parsedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public List<String> getExtractedSkills() {
        return extractedSkills;
    }

    public void setExtractedSkills(List<String> extractedSkills) {
        this.extractedSkills = extractedSkills;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getEducationLevel() {
        return educationLevel;
    }

    public void setEducationLevel(String educationLevel) {
        this.educationLevel = educationLevel;
    }

    public List<String> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<String> certifications) {
        this.certifications = certifications;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    public LocalDateTime getParsedAt() {
        return parsedAt;
    }

    public void setParsedAt(LocalDateTime parsedAt) {
        this.parsedAt = parsedAt;
    }

    public String getParsingStatus() {
        return parsingStatus;
    }

    public void setParsingStatus(String parsingStatus) {
        this.parsingStatus = parsingStatus;
    }

    public String getParsingError() {
        return parsingError;
    }

    public void setParsingError(String parsingError) {
        this.parsingError = parsingError;
    }
}
