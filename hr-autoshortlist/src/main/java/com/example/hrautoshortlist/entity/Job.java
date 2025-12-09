package com.example.hrautoshortlist.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String department;
    private Integer yearsExperiance;

    @Column(length = 4000)
    private String description;

    @Column(length = 1000)
    private String shortDescription;

    // store skills as a simple element collection
    @ElementCollection
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skills;
    private boolean active = true;

    // constructors, getters, setters
    public Job() {
    }

    public Job(String title, String department, Integer yearsExperiance, String shortDescription, String description,
            List<String> skills) {
        this.title = title;
        this.department = department;
        this.yearsExperiance = yearsExperiance;
        this.shortDescription = shortDescription;
        this.description = description;
        this.skills = skills;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

}
