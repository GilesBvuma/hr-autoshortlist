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
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class FirebaseTokenFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseTokenFilter.class);

    private final UserRepository userRepository;
    private final CandidateUserRepository candidateUserRepository;

    public FirebaseTokenFilter(CustomUserDetailsService userDetailsService, UserRepository userRepository,
            CandidateUserRepository candidateUserRepository) {
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
                    boolean isFromAdminClient = false;
                    String origin = request.getHeader("Origin");
                    if (origin != null
                            && (origin.toLowerCase().contains("admin") || origin.contains("localhost:5174"))) {
                        isFromAdminClient = true;
                    }
                    logger.info("Request Origin: {}, isFromAdminClient: {}", origin, isFromAdminClient);

                    // Try to load user from DB
                    // Strict Separation Logic
                    UserDetails userDetails = null;
                    if (isFromAdminClient) {
                        // === ADMIN FLOW ===
                        com.example.hrautoshortlist.entity.User adminUser = userRepository.findByEmailIgnoreCase(email);

                        if (adminUser == null) {
                            // Auto-create ADMIN
                            logger.info("Auto-creating ADMIN user for email: {} (Origin: {})", email, origin);
                            adminUser = new com.example.hrautoshortlist.entity.User();
                            adminUser.setEmail(email.toLowerCase());
                            adminUser.setUsername(username != null ? username : email.split("@")[0]);
                            adminUser.setPassword("EXTERNAL_USER");
                            adminUser = userRepository.save(adminUser);
                        } else {
                            logger.info("Found existing ADMIN user: {}", adminUser.getEmail());
                        }

                        // Create UserDetails for ADMIN
                        userDetails = new org.springframework.security.core.userdetails.User(
                                adminUser.getUsername(),
                                adminUser.getPassword() != null ? adminUser.getPassword() : "",
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));

                    } else {
                        // === CANDIDATE FLOW === (Default)
                        com.example.hrautoshortlist.entity.CandidateUser candidate = candidateUserRepository
                                .findByEmailIgnoreCase(email);

                        if (candidate == null) {
                            // Auto-create CANDIDATE
                            logger.info("Auto-creating CANDIDATE user for email: {} (Origin: {})", email, origin);
                            candidate = new com.example.hrautoshortlist.entity.CandidateUser();
                            candidate.setEmail(email.toLowerCase());
                            candidate.setFullName(username != null ? username : email.split("@")[0]);
                            candidate.setPhone("0000000000");
                            candidate.setPassword(null);
                            candidate = candidateUserRepository.save(candidate);
                        } else {
                            logger.info("Found existing CANDIDATE user: {}", candidate.getEmail());
                        }

                        // Create UserDetails for CANDIDATE
                        userDetails = new org.springframework.security.core.userdetails.User(
                                candidate.getEmail(),
                                "", // No password for Google auth usually, or placeholder
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CANDIDATE")));
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
