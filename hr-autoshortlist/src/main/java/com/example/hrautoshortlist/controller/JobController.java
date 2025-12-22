package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.dto.JobDTO;
import com.example.hrautoshortlist.dto.ApplicationResponseDTO;
import com.example.hrautoshortlist.entity.Job;
import com.example.hrautoshortlist.entity.Application;
import com.example.hrautoshortlist.service.JobService;
import com.example.hrautoshortlist.service.ApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }) // Both admin and candidate frontends
public class JobController {

        private static final Logger logger = LoggerFactory.getLogger(JobController.class);

        @Autowired
        private JobService jobService;

        @Autowired
        private ApplicationService applicationService;

        // GET /api/jobs - Get all jobs
        @GetMapping
        public ResponseEntity<List<JobDTO>> getAllJobs() {
                logger.info("Fetching all jobs");
                List<JobDTO> jobs = jobService.getAllJobs()
                                .stream()
                                .map(j -> new JobDTO(j.getId(), j.getTitle(), j.getDepartment(), j.getYearsExperiance(),
                                                j.getShortDescription(), j.getDescription(), j.getSkills()))
                                .collect(Collectors.toList());
                logger.info("Returning {} jobs", jobs.size());
                return ResponseEntity.ok(jobs);
        }

        // GET /api/jobs/active - Applicants see only active jobs
        @GetMapping("/active")
        public ResponseEntity<List<JobDTO>> activeJobs() {
                logger.info("Fetching active jobs");
                List<JobDTO> activeJobs = jobService.listActiveJobs();
                logger.info("Returning {} active jobs", activeJobs.size());
                return ResponseEntity.ok(activeJobs);
        }

        // GET /api/jobs/{id} - Get single job
        @GetMapping("/{id}")
        public ResponseEntity<JobDTO> getJob(@PathVariable Long id) {
                logger.info("Fetching job with ID: {}", id);
                return jobService.getJobById(id)
                                .map(j -> {
                                        JobDTO dto = new JobDTO(j.getId(), j.getTitle(), j.getDepartment(),
                                                        j.getYearsExperiance(), j.getShortDescription(),
                                                        j.getDescription(),
                                                        j.getSkills());
                                        return ResponseEntity.ok(dto);
                                })
                                .orElseGet(() -> {
                                        logger.warn("Job not found with ID: {}", id);
                                        return ResponseEntity.notFound().build();
                                });
        }

        // POST /api/jobs/create - Admin creates job
        @PostMapping("/create")
        public ResponseEntity<JobDTO> createJob(@RequestBody JobDTO dto) {
                logger.info("Creating new job: {}", dto.getTitle());
                Job job = new Job(dto.getTitle(), dto.getDepartment(), dto.getYearsExperiance(),
                                dto.getShortDescription(), dto.getDescription(), dto.getSkills());
                Job saved = jobService.createJob(job);
                JobDTO out = new JobDTO(saved.getId(), saved.getTitle(), saved.getDepartment(),
                                saved.getYearsExperiance(), saved.getShortDescription(), saved.getDescription(),
                                saved.getSkills());
                logger.info("Job created with ID: {}", saved.getId());
                return ResponseEntity.ok(out);
        }

        // GET /api/jobs/admin/all - HR views all jobs (even inactive)
        @GetMapping("/admin/all")
        public ResponseEntity<List<JobDTO>> allJobsAdmin() {
                logger.info("Admin fetching all jobs");
                return ResponseEntity.ok(getAllJobs().getBody());
        }

        // DELETE /api/jobs/{id} - HR deletes a job
        @DeleteMapping("/{id}")
        public ResponseEntity<?> delete(@PathVariable Long id) {
                logger.info("Deleting job with ID: {}", id);
                jobService.deleteJob(id);
                return ResponseEntity.ok("Deleted");
        }

        // these Get controllers manage the candidates for a specific job
        // GET /api/jobs/{jobId}/candidates - Get all candidates for a job
        @GetMapping("/{jobId}/candidates")
        public ResponseEntity<List<ApplicationResponseDTO>> getCandidatesForJob(@PathVariable Long jobId) {
                logger.info("Fetching candidates for job ID: {}", jobId);
                List<Application> applications = applicationService.getApplicationsForJob(jobId);
                List<ApplicationResponseDTO> dtos = applications.stream()
                                .map(app -> new ApplicationResponseDTO(
                                                app.getId(),
                                                app.getCandidateUser() != null ? app.getCandidateUser().getFullName()
                                                                : "Unknown",
                                                app.getCandidateUser() != null ? app.getCandidateUser().getEmail() : "",
                                                app.getCandidateUser() != null ? app.getCandidateUser().getPhone() : "",
                                                app.getSkills(),
                                                app.getCvFilename() != null ? "/uploads/" + app.getCvFilename() : null,
                                                app.getLetterFilename() != null ? "/uploads/" + app.getLetterFilename()
                                                                : null,
                                                jobId))
                                .collect(Collectors.toList());
                logger.info("Returning {} candidates for job ID: {}", dtos.size(), jobId);
                return ResponseEntity.ok(dtos);
        }

        // GET /api/jobs/{jobId}/shortlist
        @GetMapping("/{jobId}/shortlist")
        public ResponseEntity<?> getShortlistForJob(@PathVariable Long jobId) {
                logger.info("Fetching shortlist for job ID: {}", jobId);
                List<Application> applications = applicationService.getApplicationsForJob(jobId);
                List<Map<String, Object>> shortlistResults = applications.stream()
                                .map(app -> {
                                        Map<String, Object> result = new HashMap<>();
                                        result.put("applicationId", app.getId());
                                        result.put("name",
                                                        app.getCandidateUser() != null
                                                                        ? app.getCandidateUser().getFullName()
                                                                        : "Unknown");
                                        result.put("email",
                                                        app.getCandidateUser() != null
                                                                        ? app.getCandidateUser().getEmail()
                                                                        : "");
                                        result.put("shortlisted", true);
                                        return result;
                                })
                                .collect(Collectors.toList());
                return ResponseEntity.ok(shortlistResults);
        }
}
