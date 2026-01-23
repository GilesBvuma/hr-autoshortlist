package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.dto.ParsedCVData;
import com.example.hrautoshortlist.entity.Application;
import com.example.hrautoshortlist.entity.ParsedCV;
import com.example.hrautoshortlist.repository.ParsedCVRepository;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.sax.BodyContentHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service for parsing CV files (PDF, DOCX) and extracting structured
 * information.
 * Uses Apache Tika for text extraction and regex patterns for data extraction.
 */
@Service
public class CVParsingService {

    private static final Logger logger = LoggerFactory.getLogger(CVParsingService.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private final ParsedCVRepository parsedCVRepository;

    public CVParsingService(ParsedCVRepository parsedCVRepository) {
        this.parsedCVRepository = parsedCVRepository;
    }

    /**
     * Parse CV file and save to database.
     * 
     * @param forceRefresh If true, re-parses even if already in database.
     */
    public ParsedCV parseAndSaveCV(Application application, boolean forceRefresh) {
        logger.info("Parsing CV for application ID: {}", application.getId());

        // Check if already parsed
        Optional<ParsedCV> existing = parsedCVRepository.findByApplicationId(application.getId());
        if (existing.isPresent() && !forceRefresh) {
            logger.info("CV already parsed for application {}", application.getId());
            return existing.get();
        }

        ParsedCV parsedCV = existing.orElse(new ParsedCV(application));

        try {
            String cvFilename = application.getCvFilename();
            if (cvFilename == null || cvFilename.isEmpty()) {
                logger.warn("No CV file for application {}", application.getId());
                parsedCV.setParsingStatus("FAILED");
                parsedCV.setParsingError("No CV file uploaded");
                return parsedCVRepository.save(parsedCV);
            }

            // Parse the CV file
            ParsedCVData cvData = parseCVFile(cvFilename);

            // Populate entity from DTO
            parsedCV.setExtractedSkills(cvData.getExtractedSkills());
            parsedCV.setYearsOfExperience(cvData.getYearsOfExperience());
            parsedCV.setEducationLevel(cvData.getEducationLevel());
            parsedCV.setCertifications(cvData.getCertifications());
            parsedCV.setRawText(cvData.getRawText());
            parsedCV.setParsingStatus("SUCCESS");

            logger.info("Successfully parsed CV for application {}: {} skills, {} years exp, {} education",
                    application.getId(),
                    cvData.getExtractedSkills().size(),
                    cvData.getYearsOfExperience(),
                    cvData.getEducationLevel());

        } catch (Exception e) {
            logger.error("Error parsing CV for application {}", application.getId(), e);
            parsedCV.setParsingStatus("FAILED");
            parsedCV.setParsingError(e.getMessage());
        }

        return parsedCVRepository.save(parsedCV);
    }

    /**
     * Parse CV file and extract structured data
     */
    public ParsedCVData parseCVFile(String filename) throws IOException, TikaException, SAXException {
        File file = new File(uploadDir, filename);

        if (!file.exists()) {
            throw new IOException("CV file not found: " + filename);
        }

        // Extract text using Apache Tika
        String text = extractTextFromFile(file);

        // Extract structured data
        List<String> skills = extractSkills(text);
        Integer yearsExp = extractYearsOfExperience(text);
        String education = extractEducationLevel(text);
        List<String> certifications = extractCertifications(text);

        return new ParsedCVData(skills, yearsExp, education, certifications, text);
    }

    /**
     * Extract raw text from PDF/DOCX using Apache Tika
     */
    private String extractTextFromFile(File file) throws IOException, TikaException, SAXException {
        BodyContentHandler handler = new BodyContentHandler(-1); // No limit
        AutoDetectParser parser = new AutoDetectParser();
        Metadata metadata = new Metadata();

        try (FileInputStream inputStream = new FileInputStream(file)) {
            parser.parse(inputStream, handler, metadata);
        }

        return handler.toString();
    }

    /**
     * Extract skills from CV text using common programming languages, frameworks,
     * and tools
     */
    private List<String> extractSkills(String text) {
        List<String> skills = new ArrayList<>();
        String lowerText = text.toLowerCase();

        // Common technical skills to look for
        String[] commonSkills = {
                // Programming Languages
                "java", "python", "javascript", "typescript", "c++", "c#", "ruby", "php", "swift", "kotlin",
                "go", "rust", "scala", "r", "matlab", "sql", "html", "css",

                // Frameworks & Libraries
                "spring", "spring boot", "react", "angular", "vue", "node.js", "express", "django", "flask",
                "laravel", "rails", ".net", "asp.net", "hibernate", "jpa",

                // Databases
                "mysql", "postgresql", "mongodb", "oracle", "sql server", "redis", "cassandra", "dynamodb",

                // Cloud & DevOps
                "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "ci/cd", "terraform",

                // SAP
                "SAP FICO", "SAP MM", "SAP SD", "SAP HANA", "SAP ABAP", "SAP BW", "SAP CRM", "SAP BASIS", "SAP B1",
                "SAP SuccessFactors", "SAP Ariba", "SAP S/4HANA", "SAP Fiori",

                // Other
                "rest api", "microservices", "agile", "scrum", "machine learning", "data analysis",
                "project management", "leadership", "communication"
        };

        for (String skill : commonSkills) {
            if (lowerText.contains(skill.toLowerCase())) {
                skills.add(skill);
            }
        }

        // Also extract from "Skills:" section if present
        Pattern skillsSection = Pattern.compile("skills?\\s*:?\\s*([^\\n]{10,200})", Pattern.CASE_INSENSITIVE);
        Matcher matcher = skillsSection.matcher(text);
        if (matcher.find()) {
            String skillsLine = matcher.group(1);
            String[] parts = skillsLine.split("[,;|]");
            for (String part : parts) {
                String trimmed = part.trim();
                if (trimmed.length() > 2 && trimmed.length() < 50) {
                    skills.add(trimmed);
                }
            }
        }

        return skills.stream().distinct().collect(Collectors.toList());
    }

    /**
     * Extract years of experience from CV text
     */
    private Integer extractYearsOfExperience(String text) {
        // Look for patterns like "5 years", "5+ years", "5-7 years"
        Pattern pattern = Pattern.compile("(\\d+)\\s*\\+?\\s*(?:-\\s*\\d+\\s*)?years?\\s+(?:of\\s+)?experience",
                Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        // Alternative: count job positions and estimate
        Pattern jobPattern = Pattern.compile("(\\d{4})\\s*-\\s*(\\d{4}|present|current)", Pattern.CASE_INSENSITIVE);
        Matcher jobMatcher = jobPattern.matcher(text);
        int totalYears = 0;
        while (jobMatcher.find()) {
            int startYear = Integer.parseInt(jobMatcher.group(1));
            String endYearStr = jobMatcher.group(2);
            int endYear = endYearStr.matches("\\d{4}") ? Integer.parseInt(endYearStr) : 2026;
            totalYears += (endYear - startYear);
        }

        return totalYears > 0 ? totalYears : null;
    }

    /**
     * Extract highest education level from CV text
     */
    private String extractEducationLevel(String text) {
        String lowerText = text.toLowerCase();

        // 1. PhD Detection
        if (lowerText.matches(".*\\b(ph\\.?d|doctorate|doctor of philosophy)\\b.*")) {
            return "PhD";
        }

        // 2. Masters Detection (with false positive prevention)
        // Patterns that likely indicate a real degree
        Pattern mastersPattern = Pattern.compile(
                "\\b(master(?:'s)?\\s+(?:of|degree)|msc|m\\.sc|mba|m\\.a|ma|m\\.phil)\\b", Pattern.CASE_INSENSITIVE);
        // Exclusions: Contexts where "master" does NOT mean a degree
        String[] exclusions = { "scrum master", "web master", "headmaster", "mastered", "mastery", "postmaster" };

        Matcher m = mastersPattern.matcher(lowerText);
        if (m.find()) {
            boolean isExcluded = false;
            String surroundingText = lowerText.substring(Math.max(0, m.start() - 10),
                    Math.min(lowerText.length(), m.end() + 10));
            for (String exclusion : exclusions) {
                if (surroundingText.contains(exclusion)) {
                    isExcluded = true;
                    break;
                }
            }
            if (!isExcluded)
                return "Masters";
        }

        // 3. Bachelors Detection
        if (lowerText.matches(".*\\b(bachelor(?:'s)?|bsc|b\\.sc|b\\.a|ba|undergraduate|degree)\\b.*")) {
            return "Bachelors";
        }

        // 4. Diploma/Cert
        if (lowerText.contains("diploma") || lowerText.contains("hnd") || lowerText.contains("associate")) {
            return "Diploma";
        }
        if (lowerText.contains("certificate") || lowerText.contains("certification")) {
            return "Certificate";
        }

        return "Unknown";
    }

    /**
     * Extract certifications from CV text
     */
    private List<String> extractCertifications(String text) {
        List<String> certifications = new ArrayList<>();
        String lowerText = text.toLowerCase();

        // Common certifications
        String[] commonCerts = {
                "pmp", "aws certified", "azure certified", "gcp certified", "cissp", "cisa", "cism",
                "comptia", "ccna", "ccnp", "ceh", "scrum master", "safe", "itil", "six sigma"
        };

        for (String cert : commonCerts) {
            if (lowerText.contains(cert.toLowerCase())) {
                certifications.add(cert);
            }
        }

        // Look for "Certifications:" section
        Pattern certsSection = Pattern.compile("certifications?\\s*:?\\s*([^\\n]{10,300})", Pattern.CASE_INSENSITIVE);
        Matcher matcher = certsSection.matcher(text);
        if (matcher.find()) {
            String certsLine = matcher.group(1);
            String[] parts = certsLine.split("[,;|]");
            for (String part : parts) {
                String trimmed = part.trim();
                if (trimmed.length() > 3 && trimmed.length() < 100) {
                    certifications.add(trimmed);
                }
            }
        }

        return certifications.stream().distinct().collect(Collectors.toList());
    }

    /**
     * Get parsed CV data for an application (from database)
     */
    public ParsedCVData getParsedCVData(Long applicationId) {
        return parsedCVRepository.findByApplicationId(applicationId)
                .map(parsedCV -> new ParsedCVData(
                        parsedCV.getExtractedSkills(),
                        parsedCV.getYearsOfExperience(),
                        parsedCV.getEducationLevel(),
                        parsedCV.getCertifications(),
                        parsedCV.getRawText()))
                .orElse(null);
    }
}
