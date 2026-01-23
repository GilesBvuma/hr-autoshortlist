//AUTHENTICATION LAYER
package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.entity.User;
import com.example.hrautoshortlist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service // marks this class as a spring service component (business logic layer)
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Register new user . Change AuthService.register to accept a User objectIn
    // AuthService.java
    public User register(User user) {
        // hash password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Validate login
    public boolean login(String username, String password) {
        User user = userRepository.findByUsername(username);

        if (user == null)
            return false;

        return passwordEncoder.matches(password, user.getPassword());
    }

    // Logout user (stateless logout)
    public String logout(String token) {
        // For JWT-based logout, the frontend will delete the token.
        return "User logged out successfully";
    }
}
/*
 * AuthService
 * Core authentication logic
 * Hash passwords before saving users
 * Validate login credentials
 * Retrieve user from database and verify password
 * LINKS TO
 * userRepository(fetches/saves users)
 * BCryptPasswordEncoder(pasword hashing )
 * User entity
 */
