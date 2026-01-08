package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.CandidateUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateUserRepository extends JpaRepository<CandidateUser, Long> {
    CandidateUser findByFullName(String fullName);

    CandidateUser findByEmail(String email);

    CandidateUser findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);
}
