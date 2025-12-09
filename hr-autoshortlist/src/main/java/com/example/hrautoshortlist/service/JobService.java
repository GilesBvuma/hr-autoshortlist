package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.dto.JobDTO;
import com.example.hrautoshortlist.entity.Job;
import com.example.hrautoshortlist.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public Job updateJob(Job job) {
        return jobRepository.save(job);
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }

    public List<JobDTO> listActiveJobs() {
        List<Job> jobs = jobRepository.findByActiveTrue();

        return jobs.stream()
                .map(job -> new JobDTO(
                        job.getId(),
                        job.getTitle(),
                        job.getDepartment(),
                        job.getYearsExperiance(),
                        job.getShortDescription(),
                        job.getDescription(),
                        job.getSkills()))
                .toList();
    }

}
