package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.entity.CandidateUser;
import com.example.hrautoshortlist.repository.CandidateUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CandidateUserService {

    private static final Logger logger = LoggerFactory.getLogger(CandidateUserService.class);

    @Autowired
    private CandidateUserRepository candidateUserRepository;

    @Autowired
    private com.example.hrautoshortlist.repository.UserRepository userRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Transactional
    public CandidateUser register(CandidateUser a) {
        logger.info("Attempting to register user with email: {}", a.getEmail());

        // 1. Check if user already exists (case-insensitive)
        CandidateUser existing = candidateUserRepository.findByEmailIgnoreCase(a.getEmail());
        if (existing != null) {
            // Check if they already have a password (truly registered)
            if (existing.getPassword() != null && !existing.getPassword().isEmpty()) {
                logger.warn("Email already registered: {}", a.getEmail());
                throw new IllegalArgumentException("Email already registered");
            }

            // If they exist but have no password, they were likely auto-created by the
            // Firebase filter
            logger.info("Found auto-created profile for {}, updating with registration data", a.getEmail());
            existing.setFullName(a.getFullName());
            existing.setPhone(a.getPhone());
            if (a.getPassword() != null) {
                existing.setPassword(encoder.encode(a.getPassword()));
            }
            return candidateUserRepository.save(existing);
        }

        // 2. Hash the password
        if (a.getPassword() != null) {
            a.setPassword(encoder.encode(a.getPassword()));
        }
        a.setEmail(a.getEmail().toLowerCase()); // Always lowercase

        logger.info("Saving user to database...");
        CandidateUser saved = candidateUserRepository.save(a);
        logger.info("User saved successfully with ID: {}", saved.getId());

        return saved;
    }

    public boolean validateLogin(String email, String rawPassword) {
        logger.info("Validating login for email: {}", email);

        CandidateUser a = candidateUserRepository.findByEmailIgnoreCase(email);
        if (a == null) {
            logger.warn("User not found: {}", email);
            return false;
        }

        if (a.getPassword() == null) {
            logger.warn("User has no password (likely social login only): {}", email);
            return false;
        }

        boolean matches = encoder.matches(rawPassword, a.getPassword());
        logger.info("Password validation result for {}: {}", email, matches);
        return matches;
    }

    public CandidateUser findByFullName(String fullName) {
        return candidateUserRepository.findByFullName(fullName);
    }

    public CandidateUser findByEmail(String email) {
        return candidateUserRepository.findByEmailIgnoreCase(email);
    }

    public CandidateUser saveUser(CandidateUser user) {
        return candidateUserRepository.save(user);
    }

    public CandidateUser findById(Long id) {
        return candidateUserRepository.findById(id).orElse(null);
    }

    public com.example.hrautoshortlist.entity.User findAdminByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
