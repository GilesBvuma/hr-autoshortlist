package com.example.hrautoshortlist.dto;

import com.example.hrautoshortlist.enums.JobType;
import java.time.LocalDateTime;
import java.util.List;

public class JobDTO {
    private Long id;
    private String title;
    private String department;
    private Integer yearsExperiance;
    private String shortDescription;
    private String description;
    private List<String> skills;
    private boolean active;

    // NEW FIELDS
    private JobType jobType;
    private Integer numberOfOpenings;
    private LocalDateTime applicationDeadline;
    private LocalDateTime createdAt;
    private Long viewCount;
    private Integer applicantCount;

    public JobDTO() {
    }

    // Constructor with all fields
    public JobDTO(Long id, String title, String department, Integer yearsExperiance,
            String shortDescription, String description, List<String> skills,
            boolean active, JobType jobType, Integer numberOfOpenings,
            LocalDateTime applicationDeadline, LocalDateTime createdAt, Long viewCount) {
        this.id = id;
        this.title = title;
        this.department = department;
        this.yearsExperiance = yearsExperiance;
        this.shortDescription = shortDescription;
        this.description = description;
        this.skills = skills;
        this.active = active;
        this.jobType = jobType;
        this.numberOfOpenings = numberOfOpenings;
        this.applicationDeadline = applicationDeadline;
        this.createdAt = createdAt;
        this.viewCount = viewCount;
    }

    // Old constructor for backward compatibility
    public JobDTO(Long id, String title, String department, Integer yearsExperiance,
            String shortDescription, String description, List<String> skills) {
        this(id, title, department, yearsExperiance, shortDescription, description, skills,
                true, JobType.PERMANENT, 1, null, LocalDateTime.now(), 0L);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getYearsExperiance() {
        return yearsExperiance;
    }

    public void setYearsExperiance(Integer yearsExperiance) {
        this.yearsExperiance = yearsExperiance;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public JobType getJobType() {
        return jobType;
    }

    public void setJobType(JobType jobType) {
        this.jobType = jobType;
    }

    public Integer getNumberOfOpenings() {
        return numberOfOpenings;
    }

    public void setNumberOfOpenings(Integer numberOfOpenings) {
        this.numberOfOpenings = numberOfOpenings;
    }

    public LocalDateTime getApplicationDeadline() {
        return applicationDeadline;
    }

    public void setApplicationDeadline(LocalDateTime applicationDeadline) {
        this.applicationDeadline = applicationDeadline;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getViewCount() {
        return viewCount;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public Integer getApplicantCount() {
        return applicantCount;
    }

    public void setApplicantCount(Integer applicantCount) {
        this.applicantCount = applicantCount;
    }
}
