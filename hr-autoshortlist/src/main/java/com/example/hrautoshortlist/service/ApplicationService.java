package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.entity.Application;
import com.example.hrautoshortlist.entity.CandidateUser;
import com.example.hrautoshortlist.entity.Job;
import com.example.hrautoshortlist.repository.ApplicationRepository;
import com.example.hrautoshortlist.repository.CandidateUserRepository;
import com.example.hrautoshortlist.repository.JobRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationService.class);

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CandidateUserRepository candidateUserRepository;

    @Autowired
    private FileStorageService storageService;

    public Application submitApplication(
            Long jobId,
            Long candidateUserId,
            String skills,
            MultipartFile cv,
            MultipartFile letter,
            String candidateQualifications,
            MultipartFile certifications) {

        logger.info("=== SUBMIT APPLICATION ===");
        logger.info("Job ID: {}", jobId);
        logger.info("Candidate ID: {}", candidateUserId);

        // Fetch candidate
        CandidateUser candidate = candidateUserRepository.findById(candidateUserId)
                .orElseThrow(() -> {
                    logger.error("Candidate not found: {}", candidateUserId);
                    return new IllegalArgumentException("Candidate not found with ID: " + candidateUserId);
                });

        logger.info("✓ Candidate found: {}", candidate.getFullName());

        // Fetch job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> {
                    logger.error("Job not found: {}", jobId);
                    return new IllegalArgumentException("Job not found with ID: " + jobId);
                });

        logger.info("✓ Job found: {}", job.getTitle());

        // Check for duplicate application
        if (applicationRepository.existsByCandidateUser_IdAndJob_Id(candidateUserId, jobId)) {
            logger.warn("✗ Duplicate application - Candidate: {}, Job: {}", candidateUserId, jobId);
            throw new IllegalStateException("You have already applied for this job");
        }

        Application application = new Application();
        application.setJob(job);
        application.setCandidateUser(candidate);
        application.setSkills(skills);
        application.setCandidateQualifications(candidateQualifications);

        // Variables to hold filenames for parsing later
        String cvFilename = null;

        // Upload files
        if (cv != null && !cv.isEmpty()) {
            cvFilename = storageService.storeFile(cv);
            application.setCvFilename(cvFilename);
            logger.info("✓ CV stored: {}", cvFilename);
        }

        if (letter != null && !letter.isEmpty()) {
            String letterFilename = storageService.storeFile(letter);
            application.setLetterFilename(letterFilename);
            logger.info("✓ Letter stored: {}", letterFilename);
        }

        if (certifications != null && !certifications.isEmpty()) {
            String certFilename = storageService.storeFile(certifications);
            application.setCertificationsFilename(certFilename);
            logger.info("✓ Certifications stored: {}", certFilename);
        }

        logger.info("Saving application to database...");
        Application saved = applicationRepository.save(application);
        logger.info("✓ Application saved successfully with ID: {}", saved.getId());

        // Parse CV automatically if uploaded
        if (cvFilename != null) {
            try {
                logger.info("Parsing CV for application {}", saved.getId());
                cvParsingService.parseAndSaveCV(saved, false);
                logger.info("✓ CV parsed successfully");
            } catch (Exception e) {
                logger.error("Failed to parse CV for application {}, will retry during shortlisting", saved.getId(), e);
                // Don't fail the application submission if CV parsing fails
            }
        }

        return saved;
    }

    @Autowired
    private CVParsingService cvParsingService;

    public List<Application> getApplicationsForJob(Long jobId) {
        logger.info("Fetching applications for job ID: {}", jobId);
        List<Application> apps = applicationRepository.findByJob_Id(jobId);
        logger.info("Found {} applications for job {}", apps.size(), jobId);
        return apps;
    }

    public List<Application> getApplicationsForCandidate(Long candidateUserId) {
        logger.info("Fetching applications for candidate ID: {}", candidateUserId);
        return applicationRepository.findByCandidateUser_Id(candidateUserId);
    }

    public Optional<Application> getApplication(Long id) {
        return applicationRepository.findById(id);
    }

    public void deleteApplication(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new IllegalArgumentException("Application not found with ID: " + id);
        }
        logger.info("Deleting application ID: {}", id);
        applicationRepository.deleteById(id);
    }

    public boolean toggleShortlist(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        boolean newState = !app.isShortlisted();
        app.setShortlisted(newState);
        applicationRepository.save(app);
        logger.info("Application {} shortlisted status toggled to {}", applicationId, newState);
        return newState;
    }
}