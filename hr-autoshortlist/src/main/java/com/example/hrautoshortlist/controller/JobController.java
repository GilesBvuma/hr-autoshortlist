package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.dto.JobDTO;
import com.example.hrautoshortlist.entity.Job;
import com.example.hrautoshortlist.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

        @Autowired
        private JobService jobService;

        // GET /api/jobs
        @GetMapping
        public List<JobDTO> getAllJobs() {
                return jobService.getAllJobs()
                                .stream()
                                .map(j -> new JobDTO(j.getId(), j.getTitle(), j.getDepartment(), j.getYearsExperiance(),
                                                j.getShortDescription(), j.getDescription(), j.getSkills()))
                                .collect(Collectors.toList());
        }

        // GET /api/jobs/{id}
        @GetMapping("/{id}")
        public ResponseEntity<JobDTO> getJob(@PathVariable Long id) {
                return jobService.getJobById(id)
                                .map(j -> ResponseEntity.ok(new JobDTO(j.getId(), j.getTitle(), j.getDepartment(),
                                                j.getYearsExperiance(), j.getShortDescription(), j.getDescription(),
                                                j.getSkills())))
                                .orElse(ResponseEntity.notFound().build());
        }

        // POST /api/jobs (admin)
        @PostMapping("/create")
        public ResponseEntity<JobDTO> createJob(@RequestBody JobDTO dto) {
                Job job = new Job(dto.getTitle(), dto.getDepartment(), dto.getYearsExperiance(),
                                dto.getShortDescription(), dto.getDescription(), dto.getSkills());
                Job saved = jobService.createJob(job);
                JobDTO out = new JobDTO(saved.getId(), saved.getTitle(), saved.getDepartment(),
                                saved.getYearsExperiance(), saved.getShortDescription(), saved.getDescription(),
                                saved.getSkills());
                return ResponseEntity.ok(out);
        }

        // Applicant sees only active jobs
        @GetMapping("/active")
        public ResponseEntity<?> activeJobs() {
                return ResponseEntity.ok(jobService.listActiveJobs());
        }

        // HR views all jobs (even inactive)
        @GetMapping("/admin/all")
        public ResponseEntity<?> allJobs() {
                return ResponseEntity.ok(jobService.getAllJobs());
        }

        // HR deletes a job
        @DeleteMapping("/{id}")
        public ResponseEntity<?> delete(@PathVariable Long id) {
                jobService.deleteJob(id);
                return ResponseEntity.ok("Deleted");
        }

}
