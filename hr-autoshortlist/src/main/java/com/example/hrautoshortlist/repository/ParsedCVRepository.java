package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.ParsedCV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParsedCVRepository extends JpaRepository<ParsedCV, Long> {
    
    /**
     * Find parsed CV by application ID
     */
    Optional<ParsedCV> findByApplicationId(Long applicationId);
    
    /**
     * Check if CV has been parsed for an application
     */
    boolean existsByApplicationId(Long applicationId);
}
