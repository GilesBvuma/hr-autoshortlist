package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.entity.Candidate;
import com.example.hrautoshortlist.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service /// Marks this as the spring service bean
public class CandidateService {

    @Autowired // injecting the candidateRepository bean(method) into
    private CandidateRepository candidateRepository;

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll(); /// Uses repository method
    }

    public Candidate saveCandidate(Candidate candidate) {
        return candidateRepository.save(candidate); //// Uses repository method
    }

    public Candidate getCandidateById(Long id) {
        return candidateRepository.findById(id).orElse(null);/// Uses repository method
    }

    public void deleteCandidate(Long id) {
        candidateRepository.deleteById(id); /// uses repository method
    }
}
/// Business logic layer - contains application logic and uses repository for
/// data access
