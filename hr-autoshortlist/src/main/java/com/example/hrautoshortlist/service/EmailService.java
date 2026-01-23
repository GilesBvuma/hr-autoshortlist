package com.example.hrautoshortlist.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender emailSender;

    public void sendEmail(String to, String subject, String body) {
        if (emailSender == null) {
            logger.warn("JavaMailSender is not configured. Email to {} was NOT sent.", to);
            logger.info("--- SIMULATED EMAIL ---\nFrom: Tano Recruitment <noreply@tanorecruitment.com>\nTo: {}\nSubject: {}\nBody:\n{}\n-----------------------", to, subject, body);
            return;
        }

        try {
            jakarta.mail.internet.MimeMessage mimeMessage = emailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setText(body, true); // true = html capable
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("noreply@tanorecruitment.com", "Tano Recruitment");
            
            emailSender.send(mimeMessage);
            logger.info("Email sent to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {}", to, e);
            // Don't rethrow to avoid breaking bulk send loop
        }
    }
}
