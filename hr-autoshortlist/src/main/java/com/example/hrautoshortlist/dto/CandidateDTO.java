package com.example.hrautoshortlist.dto;

public class CandidateDTO {
    private Long id;
    private String fullName;
    private String email;
    private String qualification;
    private double score;

    //method
    public CandidateDTO() {}
    //Constructor
    public CandidateDTO(Long id, String fullName, String email, String qualification, double score) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.qualification = qualification;
        this.score = score;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
}
//Data transfer Object - used to transfer data between layers exposing entity details