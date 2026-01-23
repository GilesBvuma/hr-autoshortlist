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
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs/**").permitAll()
                        .requestMatchers("/uploads/**", "/api/uploads/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // APPLICATION SUBMISSION: Permit all but also explicitly allow CANDIDATE
                        .requestMatchers(HttpMethod.POST, "/api/applications", "/api/applications/").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/applications").hasAnyRole("CANDIDATE", "ADMIN")

                        // SPECIFIC AUTH PROTECTED
                        .requestMatchers("/api/auth/candidates/me").hasRole("CANDIDATE")
                        .requestMatchers("/api/auth/me").authenticated()

                        // CATCH-ALL PUBLIC AUTH
                        .requestMatchers("/api/auth/**").permitAll()

                        // ADMIN PROTECTED
                        .requestMatchers("/admin/interviews/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/applications/all", "/api/applications/shortlisted").hasRole("ADMIN")
                        .requestMatchers("/api/shortlist/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/applications/ai/shortlist/**").hasRole("ADMIN")

                        // Explicitly protect DELETE/PUT/PATCH for Admin
                        .requestMatchers(HttpMethod.DELETE, "/api/jobs/**", "/api/applications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/jobs/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/applications/**").hasRole("ADMIN")

                        // CANDIDATE PROTECTED
                        .requestMatchers("/api/candidates/**").hasRole("CANDIDATE")
                        .requestMatchers("/api/auth/candidates/me").hasRole("CANDIDATE")

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

        String origins = System.getenv("ALLOWED_ORIGINS");
        if (origins != null && !origins.isEmpty()) {
            configuration.setAllowedOrigins(Arrays.stream(origins.split(","))
                    .map(String::trim)
                    .collect(java.util.stream.Collectors.toList()));
        } else {
            // Default origins for local development
            configuration.setAllowedOrigins(Arrays.asList(
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "https://hr-autoshortlist-admin.vercel.app",
                    "https://hr-autoshortlist-candidate.vercel.app"));
        }
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
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
