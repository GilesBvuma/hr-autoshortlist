package com.example.hrautoshortlist.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.http.HttpMethod;
import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final com.example.hrautoshortlist.repository.UserRepository userRepository;
    private final com.example.hrautoshortlist.repository.CandidateUserRepository candidateUserRepository;

    public SecurityConfig(CustomUserDetailsService userDetailsService, JwtUtil jwtUtil,
            com.example.hrautoshortlist.repository.UserRepository userRepository,
            com.example.hrautoshortlist.repository.CandidateUserRepository candidateUserRepository) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.candidateUserRepository = candidateUserRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JwtFilter jwtFilter = new JwtFilter(jwtUtil, userDetailsService);
        FirebaseTokenFilter firebaseTokenFilter = new FirebaseTokenFilter(userDetailsService, userRepository,
                candidateUserRepository); // ADDED: Firebase Filter

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ADDED: Enable CORS
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // PUBLIC ENDPOINTS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Explicitly allow preflight
                        .requestMatchers("/api/auth/**").permitAll() // Login/Register
                        .requestMatchers("/api/jobs/**").permitAll() // All job endpoints (public for now)
                        .requestMatchers("/api/applications/**").permitAll() // Applications
                        .requestMatchers("/uploads/**").permitAll() // File uploads/downloads
                        .requestMatchers("/api/shortlist/**").permitAll() // Shortlist
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // PROTECTED ENDPOINTS
                        .requestMatchers("/api/candidates/**").authenticated()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(firebaseTokenFilter, UsernamePasswordAuthenticationFilter.class) // Firebase first
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ADDED: CORS Configuration Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:5174",
                "https://*.vercel.app" // ALLOW ALL VERCEL DEPLOYMENTS
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
/*
 * SecurityConfig
 * Main Spring security configuration tells spring to :
 * which endpoints are public (/login,/register)
 * which require authentication
 * what filter chain to use
 * to plug in our JwtFilter tor token auhorization
 * to disable session-based authentication(stateless)
 * 
 * LINKS TO
 * JwtFilter
 * CustomUserDetailsService
 * AuthenticationManager
 * PasswrdEncoder
 */
