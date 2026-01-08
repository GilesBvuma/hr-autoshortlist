package com.example.hrautoshortlist.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Candidate who applied
    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateUser candidateUser;

    // Job applied for
    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    // Application details
    @Column(length = 2000)
    private String skills;

    @Column(name = "cv_filename")
    private String cvFilename;

    @Column(name = "letter_filename")
    private String letterFilename;

    @Column(name = "candidate_qualifications", length = 2000)
    private String candidateQualifications;

    @Column(name = "certifications_filename")
    private String certificationsFilename;

    @Column(name = "shortlisted", columnDefinition = "boolean default false")
    private boolean shortlisted = false;

    public Application() {
    }

    public Application(CandidateUser candidateUser, Job job, String skills, String cvFilename, String letterFilename) {
        this.candidateUser = candidateUser;
        this.job = job;
        this.skills = skills;
        this.cvFilename = cvFilename;
        this.letterFilename = letterFilename;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public CandidateUser getCandidateUser() {
        return candidateUser;
    }

    public void setCandidateUser(CandidateUser candidateUser) {
        this.candidateUser = candidateUser;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getCvFilename() {
        return cvFilename;
    }

    public void setCvFilename(String cvFilename) {
        this.cvFilename = cvFilename;
    }

    public String getLetterFilename() {
        return letterFilename;
    }

    public void setLetterFilename(String letterFilename) {
        this.letterFilename = letterFilename;
    }

    // Convenience methods to get candidate details
    public String getFullname() {
        return candidateUser != null ? candidateUser.getFullName() : null;
    }

    public String getEmail() {
        return candidateUser != null ? candidateUser.getEmail() : null;
    }

    public String getPhone() {
        return candidateUser != null ? candidateUser.getPhone() : null;
    }

    // Alias for compatibility with shortlist service
    public String getSkillsSummary() {
        return skills;
    }

    public String getCandidateQualifications() {
        return candidateQualifications;
    }

    public void setCandidateQualifications(String candidateQualifications) {
        this.candidateQualifications = candidateQualifications;
    }

    public String getCertificationsFilename() {
        return certificationsFilename;
    }

    public void setCertificationsFilename(String certificationsFilename) {
        this.certificationsFilename = certificationsFilename;
    }

    public boolean isShortlisted() {
        return shortlisted;
    }

    public void setShortlisted(boolean shortlisted) {
        this.shortlisted = shortlisted;
    }
}
