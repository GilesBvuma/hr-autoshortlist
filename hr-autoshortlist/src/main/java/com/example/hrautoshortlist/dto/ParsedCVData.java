package com.example.hrautoshortlist.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO to hold parsed CV data extracted from PDF/DOCX files.
 */
public class ParsedCVData {
    
    private List<String> extractedSkills = new ArrayList<>();
    private Integer yearsOfExperience;
    private String educationLevel;
    private List<String> certifications = new ArrayList<>();
    private String rawText;
    
    public ParsedCVData() {
    }
    
    public ParsedCVData(List<String> extractedSkills, Integer yearsOfExperience, 
                        String educationLevel, List<String> certifications, String rawText) {
        this.extractedSkills = extractedSkills;
        this.yearsOfExperience = yearsOfExperience;
        this.educationLevel = educationLevel;
        this.certifications = certifications;
        this.rawText = rawText;
    }
    
    // Getters and Setters
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
}
