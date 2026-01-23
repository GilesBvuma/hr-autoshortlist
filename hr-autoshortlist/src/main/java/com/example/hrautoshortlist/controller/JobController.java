package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.dto.JobDTO;
import com.example.hrautoshortlist.dto.ApplicationResponseDTO;
import com.example.hrautoshortlist.entity.Job;
import com.example.hrautoshortlist.entity.Application;
import com.example.hrautoshortlist.enums.JobType;
import com.example.hrautoshortlist.service.JobService;
import com.example.hrautoshortlist.service.ApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Objects;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

        private static final Logger logger = LoggerFactory.getLogger(JobController.class);

        @Autowired
        private JobService jobService;

        @Autowired
        private ApplicationService applicationService;

        // GET /api/jobs - Get all jobs with full details
        @GetMapping
        public ResponseEntity<List<JobDTO>> getAllJobs() {
                logger.info("Fetching all jobs");
                List<JobDTO> jobs = jobService.getAllJobs()
                                .stream()
                                .map(jobService::convertToDTO)
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

        // GET /api/jobs/{id} - Get single job (increments view count)
        @GetMapping("/{id}")
        public ResponseEntity<JobDTO> getJob(@PathVariable Long id,
                        @RequestParam(required = false, defaultValue = "false") boolean incrementView) {
                logger.info("Fetching job with ID: {}", id);

                return jobService.getJobById(id)
                                .map(job -> {
                                        // Increment view count if requested (e.g., when candidate views details)
                                        if (incrementView) {
                                                jobService.incrementViewCount(id);
                                                logger.info("View count incremented for job: {}", id);
                                        }

                                        JobDTO dto = jobService.convertToDTO(job);
                                        return ResponseEntity.ok(dto);
                                })
                                .orElseGet(() -> {
                                        logger.warn("Job not found with ID: {}", id);
                                        return ResponseEntity.notFound().build();
                                });
        }

        // POST /api/jobs/create - Admin creates job
        @PostMapping("/create")
        public ResponseEntity<?> createJob(@RequestBody CreateJobRequest request) {
                try {
                        logger.info("Creating new job: {}", request.getTitle());
                        logger.info("Job Type: {}", request.getJobType());
                        logger.info("Openings: {}", request.getNumberOfOpenings());
                        logger.info("Deadline: {}", request.getApplicationDeadline());

                        Job job = new Job(
                                        request.getTitle(),
                                        request.getDepartment(),
                                        request.getYearsExperiance(),
                                        request.getShortDescription(),
                                        request.getDescription(),
                                        request.getSkills());

                        // Set new fields
                        if (request.getJobType() != null) {
                                job.setJobType(JobType.valueOf(request.getJobType()));
                        }
                        if (request.getNumberOfOpenings() != null) {
                                job.setNumberOfOpenings(request.getNumberOfOpenings());
                        }
                        if (request.getApplicationDeadline() != null) {
                                job.setApplicationDeadline(request.getApplicationDeadline());
                        }
                        if (request.getRequiredQualifications() != null) {
                                job.setRequiredQualifications(request.getRequiredQualifications());
                        }

                        Job saved = jobService.createJob(job);
                        JobDTO dto = jobService.convertToDTO(saved);

                        logger.info("Job created with ID: {}", saved.getId());
                        return ResponseEntity.ok(dto);

                } catch (Exception ex) {
                        logger.error("Error creating job", ex);
                        return ResponseEntity.status(500).body("Error creating job: " + ex.getMessage());
                }
        }

        // GET /api/jobs/admin/all - HR views all jobs (even inactive)
        @GetMapping("/admin/all")
        public ResponseEntity<List<JobDTO>> allJobsAdmin() {
                logger.info("Admin fetching all jobs");
                return ResponseEntity.ok(getAllJobs().getBody());
        }

        // GET /api/jobs/statistics - Dashboard statistics
        @GetMapping("/statistics")
        public ResponseEntity<Map<String, Object>> getStatistics() {
                logger.info("Fetching job statistics");

                List<Job> allJobs = jobService.getAllJobs();

                Map<String, Object> stats = new HashMap<>();
                stats.put("totalJobs", allJobs.size());
                stats.put("activeJobs", allJobs.stream().filter(Job::isActive).count());
                stats.put("inactiveJobs", allJobs.stream().filter(j -> !j.isActive()).count());
                stats.put("totalViews", allJobs.stream().mapToLong(Job::getViewCount).sum());

                // Job types breakdown
                Map<String, Long> jobTypeBreakdown = allJobs.stream()
                                .collect(Collectors.groupingBy(
                                                j -> j.getJobType() != null ? j.getJobType().name() : "PERMANENT",
                                                Collectors.counting()));
                stats.put("jobTypeBreakdown", jobTypeBreakdown);

                logger.info("Statistics: {}", stats);
                return ResponseEntity.ok(stats);
        }

        // PUT /api/jobs/{id}/toggle-status - Toggle job active status
        @PutMapping("/{id}/toggle-status")
        public ResponseEntity<?> toggleJobStatus(@PathVariable Long id) {
                logger.info("Toggling status for job: {}", id);

                return jobService.getJobById(id)
                                .map(job -> {
                                        job.setActive(!job.isActive());
                                        Job updated = jobService.updateJob(job);
                                        logger.info("Job {} status toggled to: {}", id, updated.isActive());
                                        return ResponseEntity.ok(jobService.convertToDTO(updated));
                                })
                                .orElseGet(() -> ResponseEntity.notFound().build());
        }

        // DELETE /api/jobs/{id} - HR deletes a job
        @DeleteMapping("/{id}")
        public ResponseEntity<?> delete(@PathVariable Long id) {
                logger.info("Deleting job with ID: {}", id);
                jobService.deleteJob(id);
                return ResponseEntity.ok("Deleted");
        }

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
                                                jobId,
                                                app.getJob() != null ? app.getJob().getTitle() : "Unknown",
                                                app.getCandidateUser() != null ? app.getCandidateUser().getId() : null,
                                                app.isShortlisted()))
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
                                        result.put("shortlisted", app.isShortlisted());
                                        return result;
                                })
                                .collect(Collectors.toList());
                return ResponseEntity.ok(shortlistResults);
        }

        // GET /api/jobs/shortlist-stats - Stats for "Choose Job" page
        @GetMapping("/shortlist-stats")
        public ResponseEntity<List<Map<String, Object>>> getShortlistStats() {
                logger.info("Fetching shortlist statistics for all jobs");
                List<Job> allJobs = jobService.getAllJobs();
                List<Map<String, Object>> stats = allJobs.stream()
                                .map(job -> {
                                        List<Application> apps = applicationService.getApplicationsForJob(job.getId());
                                        long count = apps.stream().filter(Application::isShortlisted).count();
                                        if (count > 0) {
                                                Map<String, Object> stat = new HashMap<>();
                                                stat.put("jobId", job.getId());
                                                stat.put("title", job.getTitle());
                                                stat.put("department", job.getDepartment());
                                                stat.put("shortlistedCount", count);
                                                return stat;
                                        }
                                        return null;
                                })
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(stats);
        }

        // DTO for creating jobs
        public static class CreateJobRequest {
                private String title;
                private String department;
                private Integer yearsExperiance;
                private String shortDescription;
                private String description;
                private List<String> skills;
                private String jobType;
                private Integer numberOfOpenings;

                private LocalDateTime applicationDeadline;
                private String requiredQualifications;

                // Getters and Setters
                public String getTitle() {
                        return title;
                }

                public void setTitle(String title) {
                        this.title = title;
                }

                public String getDepartment() {
                        return department;
                }

                public void setDepartment(String department) {
                        this.department = department;
                }

                public Integer getYearsExperiance() {
                        return yearsExperiance;
                }

                public void setYearsExperiance(Integer yearsExperiance) {
                        this.yearsExperiance = yearsExperiance;
                }

                public String getShortDescription() {
                        return shortDescription;
                }

                public void setShortDescription(String shortDescription) {
                        this.shortDescription = shortDescription;
                }

                public String getDescription() {
                        return description;
                }

                public void setDescription(String description) {
                        this.description = description;
                }

                public List<String> getSkills() {
                        return skills;
                }

                public void setSkills(List<String> skills) {
                        this.skills = skills;
                }

                public String getJobType() {
                        return jobType;
                }

                public void setJobType(String jobType) {
                        this.jobType = jobType;
                }

                public Integer getNumberOfOpenings() {
                        return numberOfOpenings;
                }

                public void setNumberOfOpenings(Integer numberOfOpenings) {
                        this.numberOfOpenings = numberOfOpenings;
                }

                public LocalDateTime getApplicationDeadline() {
                        return applicationDeadline;
                }

                public void setApplicationDeadline(LocalDateTime applicationDeadline) {
                        this.applicationDeadline = applicationDeadline;
                }

                public String getRequiredQualifications() {
                        return requiredQualifications;
                }

                public void setRequiredQualifications(String requiredQualifications) {
                        this.requiredQualifications = requiredQualifications;
                }
        }

        @Autowired
        private com.example.hrautoshortlist.service.EmailService emailService;

        // POST /api/jobs/{id}/email-shortlist
        @PostMapping("/{id}/email-shortlist")
        public ResponseEntity<?> emailShortlist(@PathVariable Long id, @RequestBody Map<String, String> payload) {
                logger.info("Sending emails to shortlisted candidates for job {}", id);
                String subject = payload.get("subject");
                String body = payload.get("body");

                if (subject == null || body == null) {
                        return ResponseEntity.badRequest().body("Subject and Body are required");
                }

                List<Application> apps = applicationService.getApplicationsForJob(id);
                long sentCount = 0;

                for (Application app : apps) {
                        if (app.isShortlisted() && app.getCandidateUser() != null
                                        && app.getCandidateUser().getEmail() != null) {
                                emailService.sendEmail(app.getCandidateUser().getEmail(), subject, body);
                                sentCount++;
                        }
                }

                logger.info("Sent (or simulated) {} emails", sentCount);
                return ResponseEntity.ok("Emails sent to " + sentCount + " candidates");
        }
}
