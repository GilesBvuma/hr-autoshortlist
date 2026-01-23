package com.example.hrautoshortlist.security;

//AUTHENTICATION LAYER
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtFilter extends OncePerRequestFilter { // Once per request filter ensures the filter is executed once per
                                                      // HTTP request

    private final JwtUtil jwtUtil; // JWTUtil Extracts usernames and Validates Tokens
    private final CustomUserDetailsService userDetailsService; // Loads user details from DB

    // The constructor is (Giving the guard his tools) . Spring injects @Bean
    // JwtUtil and CustomUserDetailsService here which are the dependencies (tools)
    // needed for this filter to function
    public JwtFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    // the heart of the filter .
    // This method runs everytime an HTTP request is made to the server . this is
    // the exact point where interception happens
    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Reading the request header(envelope) to find the Authorization header which
        // contains the Bearer token
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        // Check if the Authorization header is present and starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7); // Extracting the JWT token by removing "Bearer " prefix and puts
                                           // "eydhdhdjduehJii9.""
            try {
                username = jwtUtil.extractUsername(jwt); // Extracting username from the token using JwtUtil
            } catch (Exception e) {
                // Log error but allow request to proceed anonymously
                // This is crucial for public endpoints if client sends an expired/invalid token
                logger.warn("Invalid JWT token: " + e.getMessage());
            }
        }
        // Checking if your user is already logged in .
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username); // Loading user details from
                                                                                           // DB using
                                                                                           // CustomUserDetailsService
                if (jwtUtil.validateToken(jwt)) { // Validating the token using JwtUtil (checks expiration and
                                                  // signature)
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
                            null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                logger.warn("Could not set user authentication: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
/*
 * JWTFilter
 * Intercepts incoming HTTP requests and checks for a Bearer token (A guard at
 * the gate that checks for valid tokens)
 * Extracts the JWT from headers of the HTTP request(the headers are like the
 * envelope of a letter containing metadata about the request)
 * Validates token (using JwtUtil and checks if not expired and properly signed)
 * loads authenticated user into the Spring Security context
 * LINKS TO
 * JwtUtil(validate + extract username)
 * CustomerUserDetailsService(loads user details)
 * Spring SecurityConfig (Filter is registerd here )
 * If valid, it loads user details via
 * CustomUserDetailsService
 * and sets the Authentication in the SecurityContext. This logs the user in for
 * that specific request.
 */