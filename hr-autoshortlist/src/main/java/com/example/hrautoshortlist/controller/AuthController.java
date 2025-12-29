package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.entity.User;
import com.example.hrautoshortlist.security.JwtUtil;
import com.example.hrautoshortlist.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest body) {
        try {
            logger.info("=== REGISTER REQUEST ===");
            logger.info("Username: {}", body.username);
            logger.info("Email: {}", body.email);
            logger.info("Password length: {}", body.password != null ? body.password.length() : 0);

            // Validation
            if (body.username == null || body.username.trim().isEmpty()) {
                logger.error("Username is empty");
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (body.email == null || body.email.trim().isEmpty()) {
                logger.error("Email is empty");
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (body.password == null || body.password.length() < 8) {
                logger.error("Password too short");
                return ResponseEntity.badRequest().body("Password must be at least 8 characters");
            }

            User user = new User(body.username, body.email, body.password);
            User saved = userService.register(user);
            saved.setPassword(null); // Don't expose password

            logger.info("✓ Registration successful for user: {}", saved.getUsername());
            return ResponseEntity.ok(saved);

        } catch (IllegalArgumentException ex) {
            logger.error("✗ Registration failed: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            logger.error("✗ Unexpected error during registration", ex);
            return ResponseEntity.status(500).body("Registration failed: " + ex.getMessage());
        }
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        try {
            logger.info("=== LOGIN REQUEST ===");
            logger.info("Username: {}", body.username);
            logger.info("Password provided: {}", body.password != null && !body.password.isEmpty());

            if (body.username == null || body.username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (body.password == null || body.password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            boolean ok = userService.validateLogin(body.username, body.password);

            if (!ok) {
                logger.warn("✗ Invalid credentials for username: {}", body.username);
                return ResponseEntity.status(401).body("Invalid username or password");
            }

            String token = jwtUtil.generateToken(body.username);
            logger.info("✓ Login successful for user: {}", body.username);
            return ResponseEntity.ok(new JwtResponse(token));

        } catch (Exception ex) {
            logger.error("✗ Login error", ex);
            return ResponseEntity.status(500).body("Login failed: " + ex.getMessage());
        }
    }

    // --- DTOs ---
    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
    }

    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class JwtResponse {
        public final String token;

        public JwtResponse(String token) {
            this.token = token;
        }
    }
}
/*
 * AuthController
 * exposes REST API endpoints for registering a user /register and Logging in to
 * get a JWT token (/login)
 * it does not perform logic .only recieves requests and deligates work
 * LINKS TO
 * AuthService(where the business logic is )
 * JwtUtil(for generating JWT tokens when login is successful)
 * UserRepository indirectly via AuthService
 * 
 * EXTRAS
 * 
 * @RequestHeader extracts specific HTTP header values
 * HttpServletRequest gives access to raw request information
 */
