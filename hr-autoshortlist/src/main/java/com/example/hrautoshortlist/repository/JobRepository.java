package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByActiveTrue();
    // add custom queries if needed later
}
