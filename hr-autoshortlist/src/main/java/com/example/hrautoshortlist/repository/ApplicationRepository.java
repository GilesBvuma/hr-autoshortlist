package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByJobId(Long jobId);

    boolean existsByCandidateUserIdAndJobId(Long candidateUserId, Long jobId);

    List<Application> findByCandidateUserId(Long candidateUserId);
}
