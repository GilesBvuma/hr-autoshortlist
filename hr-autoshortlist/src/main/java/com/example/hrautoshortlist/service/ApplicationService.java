package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.entity.Application;
import com.example.hrautoshortlist.entity.Applicant;
import com.example.hrautoshortlist.entity.Job;
import com.example.hrautoshortlist.repository.ApplicationRepository;
import com.example.hrautoshortlist.repository.ApplicantRepository;
import com.example.hrautoshortlist.repository.JobRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private FileStorageService storageService;

    public Application submitApplication(
            Long jobId,
            Long applicantId,
            String skillsSummary,
            MultipartFile cv,
            MultipartFile letter) {

        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new IllegalArgumentException("Applicant not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        // PREVENT DUPLICATE APPLICATIONS
        if (applicationRepository.existsByApplicantIdAndJobId(applicantId, jobId)) {
            throw new IllegalStateException("You have already applied for this job");
        }

        String cvFilename = null;
        String letterFilename = null;

        if (cv != null && !cv.isEmpty()) {
            cvFilename = storageService.storeFile(cv);
        }

        if (letter != null && !letter.isEmpty()) {
            letterFilename = storageService.storeFile(letter);
        }

        Application application = new Application(
                skillsSummary,
                cvFilename,
                letterFilename,
                applicant,
                job);

        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsForJob(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public Optional<Application> getApplication(Long id) {
        return applicationRepository.findById(id);
    }
}
