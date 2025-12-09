package com.example.hrautoshortlist.dto;

import java.util.List;

// lightweight DTO sent to frontend
public class JobDTO {
    private Long id;
    private String title;
    private String department;
    private Integer yearsExperiance;
    private String shortDescription;
    private String description;
    private List<String> skills;

    public JobDTO() {
    }

    public JobDTO(Long id, String title, String department, Integer yearsExperiance, String shortDescription,
            String description, List<String> skills) {
        this.id = id;
        this.title = title;
        this.department = department;
        this.yearsExperiance = yearsExperiance;
        this.shortDescription = shortDescription;
        this.description = description;
        this.skills = skills;
    }

    // getters / setters
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

}
