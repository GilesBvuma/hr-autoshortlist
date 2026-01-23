package com.example.hrautoshortlist.service;

import com.example.hrautoshortlist.dto.ShortlistResult;
import com.example.hrautoshortlist.entity.Candidate;
import com.example.hrautoshortlist.repository.CandidateRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ShortlistService {

    private final CandidateRepository repository;

    public ShortlistService(CandidateRepository repository) {
        this.repository = repository;
    }

    /**
     * Compute a weighted score for a candidate.
     * - qualification weight (PhD>Masters>Degree>Diploma>Other)
     * - normalized exam score (0-100)
     * - yearsExperience adds small boost per year up to a cap
     * - skillsMatching: optional: certain keywords give bonus
     */
    public double computeScore(Candidate c, List<String> requiredSkills) {
        double base = c.getScore(); // assume 0-100

        // qualification weight
        double qWeight = switch (Optional.ofNullable(c.getQualification()).map(String::toLowerCase).orElse("")) {
            case String s when s.contains("phd") -> 1.15;
            case String s when s.contains("doctor") -> 1.15;
            default -> 1.0;
        };

        if (c.getQualification() != null) {
            String q = c.getQualification().toLowerCase();
            if (q.contains("master") || q.contains("msc") || q.contains("mba"))
                qWeight = 1.10;
            else if (q.contains("degree") || q.contains("bsc") || q.contains("ba"))
                qWeight = 1.00;
            else if (q.contains("diploma") || q.contains("hnd"))
                qWeight = 0.90;
        }

        // experience bonus: up to +10% with cap
        double expBonus = 0.0;
        if (c.getYearsExperience() != null) {
            int years = Math.max(0, c.getYearsExperience());
            expBonus = Math.min(years, 10) * 0.01; // each year -> +1%, up to 10%
        }

        // skills matching bonus: +5% per matching required skill, up to 20%
        double skillsBonus = 0.0;
        if (requiredSkills != null && !requiredSkills.isEmpty() && c.getSkills() != null) {
            String[] candidateSkills = c.getSkills().toLowerCase().split("\\s*,\\s*");
            Set<String> candSet = Arrays.stream(candidateSkills).map(String::trim).collect(Collectors.toSet());
            int matches = 0;
            for (String rs : requiredSkills)
                if (candSet.contains(rs.toLowerCase().trim()))
                    matches++;
            skillsBonus = Math.min(matches * 0.05, 0.20);
        }

        double computed = base * qWeight * (1.0 + expBonus + skillsBonus);
        // Ensure bounded 0-100
        if (computed < 0)
            computed = 0;
        if (computed > 100)
            computed = 100;
        return Math.round(computed * 100.0) / 100.0; // round to 2 decimals
    }

    /**
     * Shortlist candidates whose computed score >= threshold.
     * requiredSkills is optional.
     */
    public List<ShortlistResult> shortlistAll(double threshold, List<String> requiredSkills) {
        List<Candidate> all = repository.findAll();
        List<ShortlistResult> results = new ArrayList<>();

        for (Candidate c : all) {
            double cs = computeScore(c, requiredSkills);
            boolean shortlisted = cs >= threshold;
            String reason = "score=" + cs;
            if (shortlisted)
                reason += "; meets threshold " + threshold;
            results.add(new ShortlistResult(c.getId(), c.getFullName(), c.getEmail(), cs, shortlisted, reason));
        }
        // optionally sort by computedScore desc
        results.sort(Comparator.comparingDouble(ShortlistResult::getComputedScore).reversed());
        return results;
    }
}
