package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.dto.JobDTO;
import com.example.hrautoshortlist.entity.Job;
import com.example.hrautoshortlist.repository.ApplicationRepository;
import com.example.hrautoshortlist.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    private static final Logger logger = LoggerFactory.getLogger(JobService.class);

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }

    @Transactional
    public Job createJob(Job job) {
        logger.info("Creating job: {}", job.getTitle());
        return jobRepository.save(job);
    }

    public Job updateJob(Job job) {
        return jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(Long id) {
        logger.info("Deleting job {} and its applications", id);
        applicationRepository.deleteByJob_Id(id); // Use the repository method
        jobRepository.deleteById(id);
    }

    public List<JobDTO> listActiveJobs() {
        List<Job> jobs = jobRepository.findByActiveTrue();

        return jobs.stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional
    public void incrementViewCount(Long jobId) {
        logger.info("Incrementing view count for job: {}", jobId);
        jobRepository.incrementViewCount(jobId);
    }

    // Convert Job to JobDTO with applicant count
    public JobDTO convertToDTO(Job job) {
        int applicantCount = applicationRepository.findByJob_Id(job.getId()).size();

        JobDTO dto = new JobDTO(
                job.getId(),
                job.getTitle(),
                job.getDepartment(),
                job.getYearsExperiance(),
                job.getShortDescription(),
                job.getDescription(),
                job.getSkills(),
                job.isActive(),
                job.getJobType(),
                job.getNumberOfOpenings(),
                job.getApplicationDeadline(),
                job.getCreatedAt(),
                job.getViewCount());
        dto.setApplicantCount(applicantCount);
        return dto;
    }
}
