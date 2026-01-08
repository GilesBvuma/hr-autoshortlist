//AUTHENTICTION LAYER 
package com.example.hrautoshortlist.security;

import com.example.hrautoshortlist.entity.User;
import com.example.hrautoshortlist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

//this is a Spring dependency injection when we use @Service
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.hrautoshortlist.repository.CandidateUserRepository candidateUserRepository;

    // This method loads a user by username or email (used by Spring Security)
    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // 1. Try finding in Admin Users (by username first)
        User user = userRepository.findByUsername(usernameOrEmail);
        if (user == null) {
            user = userRepository.findByEmailIgnoreCase(usernameOrEmail);
        }

        if (user != null) {
            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    new ArrayList<>()); // No roles yet
        }

        // 2. Try finding in Candidate Users (by email)
        com.example.hrautoshortlist.entity.CandidateUser candidate = candidateUserRepository.findByEmailIgnoreCase(usernameOrEmail);
        if (candidate != null) {
            // Use their email as the "username" for Spring Security
            return new org.springframework.security.core.userdetails.User(
                    candidate.getEmail(),
                    candidate.getPassword() != null ? candidate.getPassword() : "", // Empty if Google user
                    new ArrayList<>());
        }

        throw new UsernameNotFoundException("User not found: " + usernameOrEmail);
    }
}
/*
 * CustomerUserDetailsService
 * Required by spring Security
 * loads user details from DB based on username
 * Converts User entity into a UserDetails object
 * LINKS TO
 * UserRepository(retrieves user)
 * Spring Security (used by Authentcation manager)
 * JwtFilter( calls this service to authenticate token owners)
 */