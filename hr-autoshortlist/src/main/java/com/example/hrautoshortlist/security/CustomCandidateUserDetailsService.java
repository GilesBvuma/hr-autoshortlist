package com.example.hrautoshortlist.security;

//AUTHENTICTION LAYER 

import com.example.hrautoshortlist.entity.CandidateUser;
import com.example.hrautoshortlist.repository.CandidateUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

//this is a Spring dependency injection when we use @Service
@Service
public class CustomCandidateUserDetailsService implements UserDetailsService {

    @Autowired
    private CandidateUserRepository candidateUserRepository;

    // This method loads a user by username (used by Spring Security)
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        CandidateUser candidateUser = candidateUserRepository.findByEmail(email);

        if (candidateUser == null) {
            throw new UsernameNotFoundException("User not found: " + email);
        }

        // Convert your User entity into a Spring Security UserDetails object
        // No roles yet, so we pass an empty list
        return new org.springframework.security.core.userdetails.User(
                candidateUser.getEmail(),
                candidateUser.getPassword(),
                new ArrayList<>());
    }
}
