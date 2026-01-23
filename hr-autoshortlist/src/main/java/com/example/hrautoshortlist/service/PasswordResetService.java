package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.entity.CandidateUser;
import com.example.hrautoshortlist.entity.PasswordResetToken;
import com.example.hrautoshortlist.entity.User;
import com.example.hrautoshortlist.repository.CandidateUserRepository;
import com.example.hrautoshortlist.repository.PasswordResetTokenRepository;
import com.example.hrautoshortlist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateUserRepository candidateUserRepository;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Transactional
    public void generateOTP(String email) {
        // Check if user exists (either Admin or Candidate)
        boolean exists = userRepository.existsByEmailIgnoreCase(email) ||
                candidateUserRepository.existsByEmailIgnoreCase(email);

        if (!exists) {
            throw new IllegalArgumentException("User with this email does not exist");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));

        // Delete any existing tokens for this email
        tokenRepository.deleteByEmail(email);

        // Save new token (expires in 10 minutes)
        PasswordResetToken token = new PasswordResetToken(email, otp, 10);
        tokenRepository.save(token);

        // Send Email
        String subject = "Your Password Reset OTP";
        String body = "<h3>Password Reset Request</h3>" +
                "<p>You requested a password reset. Your One-Time Pin (OTP) is:</p>" +
                "<h2 style='color: #2563eb;'>" + otp + "</h2>" +
                "<p>This OTP will expire in 10 minutes.</p>" +
                "<p>If you did not request this, please ignore this email.</p>";

        emailService.sendEmail(email, subject, body);
    }

    public boolean verifyOTP(String email, String otp) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByEmailAndOtp(email, otp);
        if (tokenOpt.isPresent()) {
            PasswordResetToken token = tokenOpt.get();
            return !token.isExpired();
        }
        return false;
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        if (!verifyOTP(email, otp)) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        String hashedPassword = encoder.encode(newPassword);

        boolean updatedAny = false;

        // Try updating Admin User
        User user = userRepository.findByEmailIgnoreCase(email);
        if (user != null) {
            user.setPassword(hashedPassword);
            userRepository.save(user);
            updatedAny = true;
        }

        // Try updating Candidate User
        CandidateUser candidate = candidateUserRepository.findByEmailIgnoreCase(email);
        if (candidate != null) {
            candidate.setPassword(hashedPassword);
            candidateUserRepository.save(candidate);
            updatedAny = true;
        }

        if (!updatedAny) {
            throw new IllegalArgumentException("User not found during reset");
        }

        // Clean up token after success
        tokenRepository.deleteByEmail(email);
    }
}
