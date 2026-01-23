package com.example.hrautoshortlist.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Unique identifier

    private String fullName;
    private String email;
    private String qualification;
    private double score;
    private Integer yearsExperience;
    private String skills;

    // Here is the default constructor - REQUIRED FOR JSON DESERIALIZATION
    // Spring uses this to create object instances from JSON
    // so you need this Candidate constructor to make objects off all the candidate
    // data(JSON) we will recieve from the createCandidate method which is using
    // @RequestBody to convert all the JSON data saved individuals int Objects
    public Candidate() {
    }

    // Parameterized constructor - for convenient object creation
    public Candidate(String fullName, String email, String qualification, double score, Integer yearsExperience,
            String skills) {
        this.fullName = fullName;
        this.email = email;
        this.qualification = qualification;
        this.score = score;
        this.yearsExperience = yearsExperience;
        this.skills = skills;
    }

    // Getters and Setters which you will POST data in JSON format on POSTMAN
    // Spring uses these to read/write object properties from JSON
    /*
     * {
     * "id": 2,
     * "fullName": "John Doe",
     * "email": "john@example.com",
     * "qualification": "Degree in Computer Science",
     * "score": 89.5
     * }
     */
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

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public void setYearsExperience(Integer yearsExperience) {
        this.yearsExperience = yearsExperience;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }
}
// JPA Entity that maps the database table . Each instance represents a row in
// the candidates tables