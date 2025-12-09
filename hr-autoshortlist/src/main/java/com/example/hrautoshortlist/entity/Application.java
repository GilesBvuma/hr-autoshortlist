package com.example.hrautoshortlist.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String skillsSummary;
    private String cvFilename;
    private String letterFilename;

    // Applicant who applied
    @ManyToOne
    @JoinColumn(name = "applicant_id")
    private Applicant applicant;

    // Job applied for
    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    public Application() {
    }

    public Application(String skillsSummary,
            String cvFilename,
            String letterFilename,
            Applicant applicant,
            Job job) {
        this.skillsSummary = skillsSummary;
        this.cvFilename = cvFilename;
        this.letterFilename = letterFilename;
        this.applicant = applicant;
        this.job = job;
    }

    public Long getId() {
        return id;
    }

    public String getSkillsSummary() {
        return skillsSummary;
    }

    public void setSkillsSummary(String skillsSummary) {
        this.skillsSummary = skillsSummary;
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

    public Applicant getApplicant() {
        return applicant;
    }

    public void setApplicant(Applicant applicant) {
        this.applicant = applicant;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }
}
