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
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
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
            @RequestParam(required = false) MultipartFile letter) {
        try {
            logger.info("Received application - Job: {}, Candidate: {}", jobId, candidateUserId);

            Application application = applicationService.submitApplication(
                    jobId,
                    candidateUserId,
                    skills,
                    cv,
                    letter);

            // Return DTO instead of full entity
            ApplicationResponseDTO response = new ApplicationResponseDTO(
                    application.getId(),
                    application.getFullname(),
                    application.getEmail(),
                    application.getPhone(),
                    application.getSkills(),
                    application.getCvFilename() != null ? "/uploads/" + application.getCvFilename() : null,
                    application.getLetterFilename() != null ? "/uploads/" + application.getLetterFilename() : null,
                    jobId);

            return ResponseEntity.ok(response);

        } catch (IllegalStateException dup) {
            logger.warn("Duplicate application: {}", dup.getMessage());
            return ResponseEntity.status(409).body(dup.getMessage());

        } catch (IllegalArgumentException notFound) {
            logger.error("Not found: {}", notFound.getMessage());
            return ResponseEntity.status(404).body(notFound.getMessage());

        } catch (Exception ex) {
            logger.error("Error submitting application", ex);
            return ResponseEntity.status(500).body("Error submitting application: " + ex.getMessage());
        }
    }

    // GET /api/applications/byJob/{jobId} - Admin views applications for a job
    @GetMapping("/applications/byJob/{jobId}")
    public ResponseEntity<List<ApplicationResponseDTO>> getByJob(@PathVariable Long jobId) {
        logger.info("Fetching applications for job ID: {}", jobId);

        List<Application> applications = applicationRepository.findByJobId(jobId);

        List<ApplicationResponseDTO> dtos = applications.stream()
                .map(app -> new ApplicationResponseDTO(
                        app.getId(),
                        app.getFullname(),
                        app.getEmail(),
                        app.getPhone(),
                        app.getSkills(),
                        app.getCvFilename() != null ? "/uploads/" + app.getCvFilename() : null,
                        app.getLetterFilename() != null ? "/uploads/" + app.getLetterFilename() : null,
                        jobId))
                .collect(Collectors.toList());

        logger.info("Returning {} applications for job {}", dtos.size(), jobId);
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
}