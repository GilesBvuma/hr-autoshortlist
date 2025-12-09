package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    Applicant findByEmail(String email);

    boolean existsByEmail(String email);
}
