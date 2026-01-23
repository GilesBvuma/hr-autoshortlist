package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.entity.User;
import com.example.hrautoshortlist.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Transactional
    public User register(User user) {
        logger.info("=== REGISTER SERVICE ===");
        logger.info("Checking username: {}", user.getUsername());
        logger.info("Checking email: {}", user.getEmail());

        // Check if username exists
        boolean usernameExists = userRepository.existsByUsername(user.getUsername());
        logger.info("Username exists in DB: {}", usernameExists);

        if (usernameExists) {
            logger.warn("✗ Username already exists: {}", user.getUsername());
            throw new IllegalArgumentException("Username already taken");
        }

        // Check if email exists
        boolean emailExists = userRepository.existsByEmail(user.getEmail());
        logger.info("Email exists in DB: {}", emailExists);

        if (emailExists) {
            logger.warn("✗ Email already exists: {}", user.getEmail());
            throw new IllegalArgumentException("Email already registered");
        }

        // Hash password
        String rawPassword = user.getPassword();
        String hashedPassword = encoder.encode(rawPassword);
        user.setPassword(hashedPassword);

        logger.info("Password hashed successfully");
        logger.info("Saving user to database...");

        User saved = userRepository.save(user);
        logger.info("✓ User registered successfully with ID: {}", saved.getId());

        return saved;
    }

    public boolean validateLogin(String username, String rawPassword) {
        logger.info("=== VALIDATE LOGIN ===");
        logger.info("Looking for username: {}", username);

        User user = userRepository.findByUsername(username);

        if (user == null) {
            logger.warn("✗ User not found in database: {}", username);

            // Let's check what users exist
            long userCount = userRepository.count();
            logger.info("Total users in database: {}", userCount);

            return false;
        }

        logger.info("✓ User found: {}", user.getUsername());
        logger.info("User email: {}", user.getEmail());
        logger.info("Stored password hash starts with: {}", user.getPassword().substring(0, 20));

        boolean matches = encoder.matches(rawPassword, user.getPassword());
        logger.info("Password match result: {}", matches);

        if (!matches) {
            logger.warn("✗ Password does not match for user: {}", username);
        } else {
            logger.info("✓ Password matches for user: {}", username);
        }

        return matches;
    }

    public boolean validateLoginByEmail(String email, String rawPassword) {
        logger.info("=== VALIDATE LOGIN BY EMAIL ===");
        logger.info("Looking for email: {}", email);

        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            logger.warn("✗ User not found with email: {}", email);
            return false;
        }

        logger.info("✓ User found: {}", user.getUsername());
        logger.info("User email: {}", user.getEmail());

        boolean matches = encoder.matches(rawPassword, user.getPassword());
        logger.info("Password match result: {}", matches);

        if (!matches) {
            logger.warn("✗ Password does not match for email: {}", email);
        } else {
            logger.info("✓ Password matches for email: {}", email);
        }

        return matches;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
