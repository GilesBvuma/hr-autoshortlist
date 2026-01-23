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

    @Autowired
    private com.example.hrautoshortlist.service.PasswordResetService passwordResetService;

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        try {
            logger.info("=== LOGIN REQUEST RECEIVED ===");
            logger.info("Identifier: {}", body.usernameOrEmail);
            logger.info("Has Password: {}", (body.password != null && !body.password.isEmpty()));

            if (body.usernameOrEmail == null || body.usernameOrEmail.trim().isEmpty()) {
                logger.error("Login failed: Username/Email is missing");
                return ResponseEntity.badRequest().body("Username or email is required");
            }
            if (body.password == null || body.password.trim().isEmpty()) {
                logger.error("Login failed: Password is missing for identifier: {}", body.usernameOrEmail);
                return ResponseEntity.badRequest().body("Password is required");
            }

            // Determine if input is valid email format
            String identifier = body.usernameOrEmail.trim();
            boolean isEmail = identifier.contains("@");

            boolean ok;
            String tokenIdentifier;

            if (isEmail) {
                // Login with email
                logger.info("Attempting login by email: {}", identifier);
                ok = userService.validateLoginByEmail(identifier, body.password);
                if (ok) {
                    User userEntity = userService.findByEmail(identifier);
                    tokenIdentifier = userEntity.getUsername();
                } else {
                    tokenIdentifier = identifier;
                }
            } else {
                // Login with username
                logger.info("Attempting login by username: {}", identifier);
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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest body) {
        try {
            passwordResetService.generateOTP(body.email);
            return ResponseEntity.ok("OTP sent to your email");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody VerifyOTPRequest body) {
        boolean valid = passwordResetService.verifyOTP(body.email, body.otp);
        if (valid) {
            return ResponseEntity.ok("OTP verified successfully");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest body) {
        try {
            passwordResetService.resetPassword(body.email, body.otp, body.newPassword);
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(org.springframework.security.core.Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String username = auth.getName();
        java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities = auth
                .getAuthorities();
        boolean isAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isCandidate = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE"));

        return ResponseEntity.ok(new UserProfileResponse(username, isAdmin, isCandidate));
    }

    // --- DTOs ---
    public static class UserProfileResponse {
        public String username;
        public boolean isAdmin;
        public boolean isCandidate;

        public UserProfileResponse(String username, boolean isAdmin, boolean isCandidate) {
            this.username = username;
            this.isAdmin = isAdmin;
            this.isCandidate = isCandidate;
        }

        public String getUsername() {
            return username;
        }

        public boolean getIsAdmin() {
            return isAdmin;
        }

        public boolean getIsCandidate() {
            return isCandidate;
        }
    }

    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class LoginRequest {
        public String usernameOrEmail;
        public String password;

        public String getUsernameOrEmail() {
            return usernameOrEmail;
        }

        public void setUsernameOrEmail(String usernameOrEmail) {
            this.usernameOrEmail = usernameOrEmail;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class ForgotPasswordRequest {
        public String email;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class VerifyOTPRequest {
        public String email;
        public String otp;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }
    }

    public static class ResetPasswordRequest {
        public String email;
        public String otp;
        public String newPassword;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    public static class JwtResponse {
        public final String token;

        public JwtResponse(String token) {
            this.token = token;
        }

        public String getToken() {
            return token;
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
