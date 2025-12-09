package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.entity.Application;
import com.example.hrautoshortlist.service.ApplicationService;
import com.example.hrautoshortlist.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ApplicationRepository applicationRepository;

    @PostMapping("/applications")
    public ResponseEntity<?> submitApplication(
            @RequestParam Long jobId,
            @RequestParam Long applicantId,
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) MultipartFile cv,
            @RequestParam(required = false) MultipartFile letter) {
        try {
            Application application = applicationService.submitApplication(
                    jobId,
                    applicantId,
                    skills,
                    cv,
                    letter);

            return ResponseEntity.ok(application);

        } catch (IllegalStateException dup) {
            return ResponseEntity.status(409).body(dup.getMessage());

        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Error submitting application: " + ex.getMessage());
        }
    }

    @GetMapping("/applications/byJob/{jobId}")
    public ResponseEntity<List<Application>> getByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationRepository.findByJobId(jobId));
    }
}
