package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.entity.Applicant;
import com.example.hrautoshortlist.service.ApplicantService;
import com.example.hrautoshortlist.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
  Candidate auth endpoints:
    POST /candidate/register   -> registers applicant (body: email, password, fullName, phone)
    POST /candidate/login      -> logs in and returns JWT as plain string (or JSON)
*/

@RestController
@RequestMapping("/candidate")
@CrossOrigin(origins = "*")
public class CandidateAuthController {

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private JwtUtil jwtUtil; // reuse existing JwtUtil

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Applicant body) {
        try {
            Applicant saved = applicantService.register(body);
            // Do not return password
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        boolean ok = applicantService.validateLogin(body.email, body.password);
        if (!ok)
            return ResponseEntity.status(401).body("Invalid credentials");
        String token = jwtUtil.generateToken(body.email);
        // return token in simple JSON object
        return ResponseEntity.ok(new JwtResponse(token));
    }

    // small DTOs
    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class JwtResponse {
        public final String token;

        public JwtResponse(String token) {
            this.token = token;
        }
    }
}
