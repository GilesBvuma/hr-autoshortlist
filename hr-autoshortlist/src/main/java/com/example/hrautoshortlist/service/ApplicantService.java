package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.entity.Applicant;
import com.example.hrautoshortlist.repository.ApplicantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ApplicantService {

    @Autowired
    private ApplicantRepository applicantRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public Applicant register(Applicant a) {
        if (applicantRepository.existsByEmail(a.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        a.setPassword(encoder.encode(a.getPassword()));
        return applicantRepository.save(a);
    }

    public boolean validateLogin(String email, String rawPassword) {
        Applicant a = applicantRepository.findByEmail(email);
        if (a == null)
            return false;
        return encoder.matches(rawPassword, a.getPassword());
    }

    public Applicant findByEmail(String email) {
        return applicantRepository.findByEmail(email);
    }

    public Applicant findById(Long id) {
        return applicantRepository.findById(id).orElse(null);
    }
}
