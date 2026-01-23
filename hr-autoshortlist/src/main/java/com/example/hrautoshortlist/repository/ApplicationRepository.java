package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // FIXED: Changed from findByJobId to findByJob_Id (Spring Data JPA syntax for
    // nested properties)
    List<Application> findByJob_Id(Long jobId);

    // FIXED: Same here
    boolean existsByCandidateUser_IdAndJob_Id(Long candidateUserId, Long jobId);

    // FIXED: And here
    List<Application> findByCandidateUser_Id(Long candidateUserId);
    // NEW: For cascading delete
    void deleteByJob_Id(Long jobId);
}
