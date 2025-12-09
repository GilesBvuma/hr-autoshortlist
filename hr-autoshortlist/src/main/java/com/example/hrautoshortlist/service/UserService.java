package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.entity.User;
import com.example.hrautoshortlist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Find user by username (used for login + autofill)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User findByEmail(String Email) {
        return userRepository.findByEmail(Email);
    }

    // Save new user (candidate or HR)
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Optional: find by ID
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
