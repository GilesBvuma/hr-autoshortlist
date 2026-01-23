package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.entity.CandidateUser;
import com.example.hrautoshortlist.security.JwtUtil;
import com.example.hrautoshortlist.service.CandidateUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/auth")
public class CandidateAuthController {

    private static final Logger logger = LoggerFactory.getLogger(CandidateAuthController.class);

    @Autowired
    private CandidateUserService candidateUserService;

    @Autowired
    private JwtUtil jwtUtil;

    // REGISTER
    @PostMapping("/CandidateRegister")
    public ResponseEntity<?> register(@RequestBody CandidateUser body) {
        try {
            logger.info("Registration attempt for email: {}", body.getEmail());

            // Validate input
            if (body.getEmail() == null || body.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (body.getPassword() == null || body.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }
            if (body.getFullName() == null || body.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Full name is required");
            }
            if (body.getPhone() == null || body.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Phone is required");
            }

            CandidateUser saved = candidateUserService.register(body);
            saved.setPassword(null); // do not expose password

            logger.info("Registration successful for email: {}", saved.getEmail());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            logger.error("Registration failed: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            logger.error("Unexpected error during registration", ex);
            return ResponseEntity.status(500).body("Registration failed: " + ex.getMessage());
        }
    }

    // GET /api/auth/candidates/me - Get current candidate profile
    @GetMapping("/candidates/me")
    public ResponseEntity<?> getMe() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            String identifier = auth.getName();
            logger.info("Fetching profile for identifier: {}", identifier);

            // 1. Try finding by identifier (usually email)
            CandidateUser candidate = candidateUserService.findByEmail(identifier);

            // 2. Fallback: If identifier is an Admin username, find Admin user first to get
            // their email
            if (candidate == null) {
                logger.info("Identifier not found in candidate table, checking if it's an admin username: {}",
                        identifier);
                com.example.hrautoshortlist.entity.User adminUser = candidateUserService
                        .findAdminByUsername(identifier);
                if (adminUser != null && adminUser.getEmail() != null) {
                    logger.info("Found admin user, checking candidate profile by email: {}", adminUser.getEmail());
                    candidate = candidateUserService.findByEmail(adminUser.getEmail());
                }
            }

            if (candidate == null) {
                return ResponseEntity.status(404).body("Candidate profile not found");
            }

            candidate.setPassword(null); // Safety
            return ResponseEntity.ok(candidate);
        } catch (Exception ex) {
            logger.error("Error fetching current candidate profile", ex);
            return ResponseEntity.status(500).body("Error fetching profile: " + ex.getMessage());
        }
    }

    // LOGIN
    @PostMapping("/CandidateLogin")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        try {
            logger.info("Login attempt for email: {}", body.email);

            boolean ok = candidateUserService.validateLogin(body.email, body.password);
            if (!ok) {
                logger.warn("Invalid credentials for email: {}", body.email);
                return ResponseEntity.status(401).body("Invalid credentials");
            }

            String token = jwtUtil.generateToken(body.email);
            logger.info("Login successful for email: {}", body.email);
            return ResponseEntity.ok(new JwtResponse(token));
        } catch (Exception ex) {
            logger.error("Login error", ex);
            return ResponseEntity.status(500).body("Login failed: " + ex.getMessage());
        }
    }

    // --- DTOs ---
    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class JwtResponse {
        public final String token;

        public JwtResponse(String token) {
            this.token = token;
        }
    }
}
