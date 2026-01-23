package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.dto.InterviewRequestDTO;
import com.example.hrautoshortlist.entity.CandidateUser;
import com.example.hrautoshortlist.entity.InterviewInvitation;
import com.example.hrautoshortlist.entity.Job;
import com.example.hrautoshortlist.repository.CandidateUserRepository;
import com.example.hrautoshortlist.repository.InterviewInvitationRepository;
import com.example.hrautoshortlist.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class InterviewService {

    @Autowired
    private CandidateUserRepository candidateUserRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private InterviewInvitationRepository invitationRepository;

    @Autowired
    private EmailService emailService;

    public Map<String, Integer> sendInvitations(InterviewRequestDTO request) {
        int sentCount = 0;
        int failedCount = 0;

        Job job = jobRepository.findById(request.getJobId()).orElse(null);
        if (job == null) {
            throw new RuntimeException("Job not found");
        }

        for (Long candidateId : request.getCandidateIds()) {
            CandidateUser candidate = candidateUserRepository.findById(candidateId).orElse(null);
            if (candidate == null) {
                failedCount++;
                continue;
            }

            try {
                String emailBody = generateEmailBody(candidate, job, request);
                emailService.sendEmail(candidate.getEmail(), "Interview Invitation - " + job.getTitle(), emailBody);

                InterviewInvitation invitation = new InterviewInvitation();
                invitation.setCandidateUser(candidate);
                invitation.setJob(job);
                invitation.setInterviewDate(request.getInterviewDate());
                invitation.setInterviewTime(request.getInterviewTime());
                invitation.setInterviewMode(request.getInterviewMode());
                invitation.setInterviewLocation(request.getInterviewLocation());
                invitation.setStatus("SENT");
                invitationRepository.save(invitation);

                sentCount++;
            } catch (Exception e) {
                failedCount++;
                InterviewInvitation invitation = new InterviewInvitation();
                invitation.setCandidateUser(candidate);
                invitation.setJob(job);
                invitation.setInterviewDate(request.getInterviewDate());
                invitation.setInterviewTime(request.getInterviewTime());
                invitation.setInterviewMode(request.getInterviewMode());
                invitation.setInterviewLocation(request.getInterviewLocation());
                invitation.setStatus("FAILED");
                invitationRepository.save(invitation);
            }
        }

        Map<String, Integer> result = new HashMap<>();
        result.put("sent", sentCount);
        result.put("failed", failedCount);
        return result;
    }

    private String generateEmailBody(CandidateUser candidate, Job job, InterviewRequestDTO request) {
        String template = "Dear {{candidateName}},<br><br>" +
                "We are pleased to invite you for an interview for the position of <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.<br><br>"
                +
                "<strong>Interview Details:</strong><br>" +
                "Date: {{interviewDate}}<br>" +
                "Time: {{interviewTime}}<br>" +
                "Mode: {{interviewMode}}<br>" +
                "Location/Link: {{interviewLocation}}<br><br>" +
                "We look forward to meeting you.<br><br>" +
                "Best Regards,<br>" +
                "HR Team - {{companyName}}";

        return template
                .replace("{{candidateName}}", candidate.getFullName())
                .replace("{{jobTitle}}", job.getTitle())
                .replace("{{interviewDate}}", request.getInterviewDate())
                .replace("{{interviewTime}}", request.getInterviewTime())
                .replace("{{interviewMode}}", request.getInterviewMode())
                .replace("{{interviewLocation}}", request.getInterviewLocation())
                .replace("{{companyName}}", "Tano Recruitment");
    }
}
