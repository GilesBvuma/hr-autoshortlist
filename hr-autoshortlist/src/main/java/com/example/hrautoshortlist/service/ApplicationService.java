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
            MultipartFile cvFile,
            MultipartFile letterFile) {

        logger.info("Submitting application - Job ID: {}, Candidate ID: {}", jobId, candidateUserId);

        // Fetch candidate
        CandidateUser candidate = candidateUserRepository.findById(candidateUserId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found with ID: " + candidateUserId));

        // Fetch job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));

        // Check for duplicate application
        if (applicationRepository.existsByCandidateUserIdAndJobId(candidateUserId, jobId)) {
            logger.warn("Duplicate application attempt - Candidate: {}, Job: {}", candidateUserId, jobId);
            throw new IllegalStateException("You have already applied for this job");
        }

        // Store files
        String cvFilename = null;
        String letterFilename = null;

        if (cvFile != null && !cvFile.isEmpty()) {
            cvFilename = storageService.storeFile(cvFile);
            logger.info("CV stored: {}", cvFilename);
        }

        if (letterFile != null && !letterFile.isEmpty()) {
            letterFilename = storageService.storeFile(letterFile);
            logger.info("Letter stored: {}", letterFilename);
        }

        // Create application
        Application application = new Application(
                candidate,
                job,
                skills,
                cvFilename,
                letterFilename);

        Application saved = applicationRepository.save(application);
        logger.info("Application submitted successfully with ID: {}", saved.getId());

        return saved;
    }

    public List<Application> getApplicationsForJob(Long jobId) {
        logger.info("Fetching applications for job ID: {}", jobId);
        return applicationRepository.findByJobId(jobId);
    }

    public List<Application> getApplicationsForCandidate(Long candidateUserId) {
        logger.info("Fetching applications for candidate ID: {}", candidateUserId);
        return applicationRepository.findByCandidateUserId(candidateUserId);
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
}