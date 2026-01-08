package com.example.hrautoshortlist.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * JobCriteria defines the detailed requirements and scoring weights for a job.
 * Used by the intelligent shortlisting system to score and rank candidates.
 */
@Entity
@Table(name = "job_criteria")
public class JobCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "job_id", unique = true)
    private Job job;

    // Required skills (must-have) - weighted heavily in scoring
    @ElementCollection
    @CollectionTable(name = "job_criteria_required_skills", joinColumns = @JoinColumn(name = "criteria_id"))
    @Column(name = "skill")
    private List<String> requiredSkills = new ArrayList<>();

    // Preferred skills (nice-to-have) - bonus points in scoring
    @ElementCollection
    @CollectionTable(name = "job_criteria_preferred_skills", joinColumns = @JoinColumn(name = "criteria_id"))
    @Column(name = "skill")
    private List<String> preferredSkills = new ArrayList<>();

    // Minimum years of experience required
    @Column(name = "minimum_years_experience")
    private Integer minimumYearsExperience = 0;

    // Required education levels (e.g., "Bachelors", "Masters", "PhD")
    @ElementCollection
    @CollectionTable(name = "job_criteria_education_levels", joinColumns = @JoinColumn(name = "criteria_id"))
    @Column(name = "education_level")
    private List<String> requiredEducationLevels = new ArrayList<>();

    // Keywords for matching (tools, frameworks, certifications)
    @ElementCollection
    @CollectionTable(name = "job_criteria_keywords", joinColumns = @JoinColumn(name = "criteria_id"))
    @Column(name = "keyword")
    private List<String> keywords = new ArrayList<>();

    // Location preference (optional)
    private String location;

    // Scoring weights (sum should be 1.0)
    @Column(name = "skills_weight")
    private Double skillsWeight = 0.40; // 40% weight on skills matching

    @Column(name = "experience_weight")
    private Double experienceWeight = 0.25; // 25% weight on experience

    @Column(name = "education_weight")
    private Double educationWeight = 0.20; // 20% weight on education

    @Column(name = "keywords_weight")
    private Double keywordsWeight = 0.15; // 15% weight on keywords

    // Constructors
    public JobCriteria() {
    }

    public JobCriteria(Job job) {
        this.job = job;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<String> getPreferredSkills() {
        return preferredSkills;
    }

    public void setPreferredSkills(List<String> preferredSkills) {
        this.preferredSkills = preferredSkills;
    }

    public Integer getMinimumYearsExperience() {
        return minimumYearsExperience;
    }

    public void setMinimumYearsExperience(Integer minimumYearsExperience) {
        this.minimumYearsExperience = minimumYearsExperience;
    }

    public List<String> getRequiredEducationLevels() {
        return requiredEducationLevels;
    }

    public void setRequiredEducationLevels(List<String> requiredEducationLevels) {
        this.requiredEducationLevels = requiredEducationLevels;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getSkillsWeight() {
        return skillsWeight;
    }

    public void setSkillsWeight(Double skillsWeight) {
        this.skillsWeight = skillsWeight;
    }

    public Double getExperienceWeight() {
        return experienceWeight;
    }

    public void setExperienceWeight(Double experienceWeight) {
        this.experienceWeight = experienceWeight;
    }

    public Double getEducationWeight() {
        return educationWeight;
    }

    public void setEducationWeight(Double educationWeight) {
        this.educationWeight = educationWeight;
    }

    public Double getKeywordsWeight() {
        return keywordsWeight;
    }

    public void setKeywordsWeight(Double keywordsWeight) {
        this.keywordsWeight = keywordsWeight;
    }
}
