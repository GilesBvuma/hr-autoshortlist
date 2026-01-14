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
@RequestMapping("/api/auth")
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
            logger.info("Username or Email: {}", body.usernameOrEmail);

            if (body.usernameOrEmail == null || body.usernameOrEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username or email is required");
            }
            if (body.password == null || body.password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            // Determine if input is valid email format
            String identifier = body.usernameOrEmail.trim();
            boolean isEmail = identifier.contains("@");

            boolean ok;
            String tokenIdentifier;

            if (isEmail) {
                // Login with email
                ok = userService.validateLoginByEmail(identifier, body.password);
                // For token generation, we'll try to find the username associated with this
                // email
                // or just use the email if that's how your JwtUtil works.
                // Assuming JwtUtil expects username usually, let's fetch the user.
                if (ok) {
                    User user = userService.findByEmail(identifier);
                    tokenIdentifier = user.getUsername();
                } else {
                    tokenIdentifier = identifier;
                }
            } else {
                // Login with username
                ok = userService.validateLogin(identifier, body.password);
                tokenIdentifier = identifier;
            }

            if (!ok) {
                logger.warn("✗ Invalid credentials for: {}", identifier);
                return ResponseEntity.status(401).body("Invalid username or password");
            }

            String token = jwtUtil.generateToken(tokenIdentifier);
            logger.info("✓ Login successful for: {}", tokenIdentifier);
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
        public String usernameOrEmail;
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
