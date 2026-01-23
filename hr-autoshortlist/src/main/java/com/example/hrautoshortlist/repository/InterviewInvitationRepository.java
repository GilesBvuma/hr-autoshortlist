package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.InterviewInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewInvitationRepository extends JpaRepository<InterviewInvitation, Long> {
    List<InterviewInvitation> findByCandidateUser_Id(Long candidateUserId);

    List<InterviewInvitation> findByJob_Id(Long jobId);
}
