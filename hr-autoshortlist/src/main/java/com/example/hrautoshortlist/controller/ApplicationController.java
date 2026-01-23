package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.dto.ShortlistResult;
import com.example.hrautoshortlist.dto.ApplicationResponseDTO;
import com.example.hrautoshortlist.entity.Application;
import com.example.hrautoshortlist.service.ApplicationService;
import com.example.hrautoshortlist.service.ApplicationShortlistService;
import com.example.hrautoshortlist.repository.ApplicationRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationController.class);

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ApplicationShortlistService shortlistService;

    // POST /api/applications - Candidate submits application
    @PostMapping("/applications")
    public ResponseEntity<?> submitApplication(
            @RequestParam Long jobId,
            @RequestParam Long candidateUserId,
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) MultipartFile cv,
            @RequestParam(required = false) MultipartFile letter,
            @RequestParam(required = false) String candidateQualifications,
            @RequestParam(required = false) MultipartFile certifications) {
        try {
            logger.info("=== APPLICATION SUBMISSION ===");
            logger.info("Job ID: {}", jobId);
            logger.info("Candidate User ID: {}", candidateUserId);
            logger.info("Skills: {}", skills);
            logger.info("qualifications: {}", candidateQualifications);
            logger.info("CV: {}", cv != null ? cv.getOriginalFilename() : "None");
            logger.info("Letter: {}", letter != null ? letter.getOriginalFilename() : "None");
            logger.info("Certifications: {}", certifications != null ? certifications.getOriginalFilename() : "None");

            Application application = applicationService.submitApplication(
                    jobId,
                    candidateUserId,
                    skills,
                    cv,
                    letter,
                    candidateQualifications,
                    certifications);

            logger.info("✓ Application saved with ID: {}", application.getId());

            // Return DTO instead of full entity
            ApplicationResponseDTO response = new ApplicationResponseDTO(
                    application.getId(),
                    application.getFullname(),
                    application.getEmail(),
                    application.getPhone(),
                    application.getSkills(),
                    application.getCvFilename() != null ? "/uploads/" + application.getCvFilename() : null,
                    application.getLetterFilename() != null ? "/uploads/" + application.getLetterFilename() : null,
                    jobId,
                    application.getJob() != null ? application.getJob().getTitle() : "Unknown",
                    application.getCandidateUser() != null ? application.getCandidateUser().getId() : null,
                    application.isShortlisted());

            return ResponseEntity.ok(response);

        } catch (IllegalStateException dup) {
            logger.warn("✗ Duplicate application: {}", dup.getMessage());
            return ResponseEntity.status(409).body(dup.getMessage());

        } catch (IllegalArgumentException notFound) {
            logger.error("✗ Not found: {}", notFound.getMessage());
            return ResponseEntity.status(404).body(notFound.getMessage());

        } catch (Exception ex) {
            logger.error("✗ Error submitting application", ex);
            return ResponseEntity.status(500).body("Error submitting application: " + ex.getMessage());
        }
    }

    // GET /api/applications/byJob/{jobId} - Admin views applications for a job
    @GetMapping("/applications/byJob/{jobId}")
    public ResponseEntity<List<ApplicationResponseDTO>> getByJob(@PathVariable Long jobId) {
        logger.info("=== FETCHING APPLICATIONS FOR JOB ===");
        logger.info("Job ID: {}", jobId);

        List<Application> applications = applicationRepository.findByJob_Id(jobId); // FIXED: Use findByJob_Id

        logger.info("Found {} applications", applications.size());

        List<ApplicationResponseDTO> dtos = applications.stream()
                .map(app -> {
                    logger.info("Processing application ID: {}, Candidate: {}",
                            app.getId(),
                            app.getCandidateUser() != null ? app.getCandidateUser().getFullName() : "Unknown");

                    return new ApplicationResponseDTO(
                            app.getId(),
                            app.getFullname(),
                            app.getEmail(),
                            app.getPhone(),
                            app.getSkills(),
                            app.getCvFilename() != null ? "/uploads/" + app.getCvFilename() : null,
                            app.getLetterFilename() != null ? "/uploads/" + app.getLetterFilename() : null,
                            jobId,
                            app.getJob() != null ? app.getJob().getTitle() : "Unknown",
                            app.getCandidateUser() != null ? app.getCandidateUser().getId() : null,
                            app.isShortlisted());
                })
                .collect(Collectors.toList());

        logger.info("Returning {} DTOs for job {}", dtos.size(), jobId);
        return ResponseEntity.ok(dtos);
    }

    // NEW: GET /api/applications/all - Get all applications across all jobs
    @GetMapping("/applications/all")
    public ResponseEntity<List<ApplicationResponseDTO>> getAllApplications() {
        logger.info("Fetching all applications across all jobs");

        List<Application> applications = applicationRepository.findAll();

        List<ApplicationResponseDTO> dtos = applications.stream()
                .map(app -> new ApplicationResponseDTO(
                        app.getId(),
                        app.getCandidateUser() != null ? app.getCandidateUser().getFullName() : "Unknown",
                        app.getCandidateUser() != null ? app.getCandidateUser().getEmail() : "",
                        app.getCandidateUser() != null ? app.getCandidateUser().getPhone() : "",
                        app.getSkills(),
                        app.getCvFilename() != null ? "/uploads/" + app.getCvFilename() : null,
                        app.getLetterFilename() != null ? "/uploads/" + app.getLetterFilename() : null,
                        app.getJob() != null ? app.getJob().getId() : null,
                        app.getJob() != null ? app.getJob().getTitle() : "Unknown",
                        app.getCandidateUser() != null ? app.getCandidateUser().getId() : null,
                        app.isShortlisted()))
                .collect(Collectors.toList());

        logger.info("Returning {} total applications", dtos.size());
        return ResponseEntity.ok(dtos);
    }

    // DELETE /api/applications/{id} - Delete an application
    @DeleteMapping("/applications/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        try {
            applicationService.deleteApplication(id);
            return ResponseEntity.ok("Application deleted successfully");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        }
    }

    // POST /api/applications/ai/shortlist/{jobId} - AI shortlist top N candidates
    @PostMapping("/applications/ai/shortlist/{jobId}")
    public ResponseEntity<List<ShortlistResult>> aiShortlist(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "3") int topN) {

        logger.info("AI shortlisting for job {}, top {}", jobId, topN);

        try {
            List<ShortlistResult> results = shortlistService.shortlistApplications(jobId, topN);
            return ResponseEntity.ok(results);
        } catch (Exception ex) {
            logger.error("Error in AI shortlist", ex);
            return ResponseEntity.status(500).build();
        }
    }

    // PATCH /api/applications/{id}/toggle-shortlist
    @PatchMapping("/applications/{id}/toggle-shortlist")
    public ResponseEntity<?> toggleShortlist(@PathVariable Long id) {
        try {
            boolean isShortlisted = applicationService.toggleShortlist(id);
            return ResponseEntity.ok(isShortlisted);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Error toggling shortlist: " + ex.getMessage());
        }
    }
}