package com.example.hrautoshortlist.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.example.hrautoshortlist.entity.User;
import com.example.hrautoshortlist.repository.UserRepository;
import com.example.hrautoshortlist.repository.CandidateUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseTokenFilter.class);

    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final CandidateUserRepository candidateUserRepository;

    public FirebaseTokenFilter(CustomUserDetailsService userDetailsService, UserRepository userRepository, CandidateUserRepository candidateUserRepository) {
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.candidateUserRepository = candidateUserRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                // Verify Token with Firebase
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String email = decodedToken.getEmail();
                String uid = decodedToken.getUid();
                String username = decodedToken.getName(); // Might be null

                if (email != null) {
                    logger.info("Firebase token verified for email: {}, uid: {}", email, uid);
                
                    // Try to load user from DB
                    UserDetails userDetails;
                    try {
                        userDetails = userDetailsService.loadUserByUsername(email); 
                        logger.info("UserDetails loaded successfully for email: {}", email);
                    } catch (UsernameNotFoundException e) {
                        logger.info("User {} not found by UserDetailsService, checking Candidate repository", email);
                        // Not an Admin? Check if they are a Candidate or should be created as one
                        com.example.hrautoshortlist.entity.CandidateUser candidate = candidateUserRepository.findByEmailIgnoreCase(email);
                        
                        if (candidate == null) {
                            // AUTO-CREATE Candidate (Default for non-admin firebase users)
                            logger.info("Auto-creating Candidate user for email: {}", email);
                            candidate = new com.example.hrautoshortlist.entity.CandidateUser();
                            candidate.setEmail(email.toLowerCase()); // Always store lowercase
                            candidate.setFullName(username != null ? username : email.split("@")[0]);
                            candidate.setPhone("0000000000"); // Placeholder
                            candidate.setPassword(null); // No password for Google/Firebase users
                            candidateUserRepository.save(candidate);
                        }
                        
                        // Load again (now it should exist)
                        userDetails = userDetailsService.loadUserByUsername(email);
                    }
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }

            } catch (Exception e) {
                logger.error("Firebase Token verification failed for token: {}... Error: {}", 
                    token.substring(0, Math.min(token.length(), 10)), e.getMessage(), e);
            }
        }

        chain.doFilter(request, response);
    }
}
