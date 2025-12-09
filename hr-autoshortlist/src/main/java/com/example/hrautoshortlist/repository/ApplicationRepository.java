package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // Prevent duplicate applications
    boolean existsByApplicantIdAndJobId(Long applicantId, Long jobId);

    // HR: list all applicants for a job
    List<Application> findByJobId(Long jobId);
}
