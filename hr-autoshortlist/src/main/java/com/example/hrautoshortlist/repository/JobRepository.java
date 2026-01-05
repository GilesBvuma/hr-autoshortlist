package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByActiveTrue();

    // Increment view count
    @Modifying
    @Transactional
    @Query("UPDATE Job j SET j.viewCount = j.viewCount + 1 WHERE j.id = :jobId")
    void incrementViewCount(@Param("jobId") Long jobId);

    // Count jobs by status
    long countByActiveTrue();

    long countByActiveFalse();
}
