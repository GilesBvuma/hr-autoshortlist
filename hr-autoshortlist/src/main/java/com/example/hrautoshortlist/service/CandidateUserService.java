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

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Transactional
    public CandidateUser register(CandidateUser a) {
        logger.info("Attempting to register user with email: {}", a.getEmail());

        if (candidateUserRepository.existsByEmail(a.getEmail())) {
            logger.warn("Email already registered: {}", a.getEmail());
            throw new IllegalArgumentException("Email already registered");
        }

        // Hash the password
        String hashedPassword = encoder.encode(a.getPassword());
        a.setPassword(hashedPassword);

        logger.info("Saving user to database...");
        CandidateUser saved = candidateUserRepository.save(a);
        logger.info("User saved successfully with ID: {}", saved.getId());

        return saved;
    }

    public boolean validateLogin(String email, String rawPassword) {
        logger.info("Validating login for email: {}", email);

        CandidateUser a = candidateUserRepository.findByEmail(email);
        if (a == null) {
            logger.warn("User not found: {}", email);
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
        return candidateUserRepository.findByEmail(email);
    }

    public CandidateUser saveUser(CandidateUser user) {
        return candidateUserRepository.save(user);
    }

    public CandidateUser findById(Long id) {
        return candidateUserRepository.findById(id).orElse(null);
    }
}
