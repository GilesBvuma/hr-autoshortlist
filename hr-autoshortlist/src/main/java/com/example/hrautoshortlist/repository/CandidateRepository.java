package com.example.hrautoshortlist.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hrautoshortlist.entity.Candidate;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    // Custom queries can go here later, e.g.:
    // List<Candidate> findByQualification(String qualification);
}
// Spring Data JPA repository provides database operations without
// implementation .