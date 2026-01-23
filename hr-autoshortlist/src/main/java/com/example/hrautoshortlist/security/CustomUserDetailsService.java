//AUTHENTICTION LAYER 
package com.example.hrautoshortlist.security;

import com.example.hrautoshortlist.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;

//this is a Spring dependency injection when we use @Service
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.hrautoshortlist.repository.CandidateUserRepository candidateUserRepository;

    // This method loads a user by username or email (used by Spring Security)
    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        logger.info("CustomUserDetailsService: Attempting to load user for: {}", usernameOrEmail);

        // 1. Try finding in Admin Users (by username first)
        com.example.hrautoshortlist.entity.User userEntity = userRepository.findByUsername(usernameOrEmail);
        if (userEntity == null) {
            userEntity = userRepository.findByEmailIgnoreCase(usernameOrEmail);
        }

        if (userEntity != null) {
            logger.info("CustomUserDetailsService: Found Admin user: {}", userEntity.getUsername());
            return new org.springframework.security.core.userdetails.User(
                    userEntity.getUsername(),
                    userEntity.getPassword() != null ? userEntity.getPassword() : "",
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));
        }

        // 2. Try finding in Candidate Users (by email)
        com.example.hrautoshortlist.entity.CandidateUser candidate = candidateUserRepository
                .findByEmailIgnoreCase(usernameOrEmail);
        if (candidate != null) {
            // Use their email as the "username" for Spring Security
            return new org.springframework.security.core.userdetails.User(
                    candidate.getEmail(),
                    candidate.getPassword() != null ? candidate.getPassword() : "", // Empty if Google user
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_CANDIDATE")));
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