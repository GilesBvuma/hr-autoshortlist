package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.JobCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobCriteriaRepository extends JpaRepository<JobCriteria, Long> {
    
    /**
     * Find job criteria by job ID
     */
    Optional<JobCriteria> findByJobId(Long jobId);
    
    /**
     * Check if criteria exists for a job
     */
    boolean existsByJobId(Long jobId);
}
