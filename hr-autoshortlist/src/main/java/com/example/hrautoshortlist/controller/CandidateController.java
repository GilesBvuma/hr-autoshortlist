package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.entity.Candidate;
import com.example.hrautoshortlist.repository.CandidateRepository;
import com.example.hrautoshortlist.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // @RestController acts as both a @Controller and a ResponseBody automatically
                // turns return values to JSON/XMl data
@RequestMapping("/api/candidates") // Base URL for all endpoints . Meaning all methods in this controller start
                                   // with "/api/candidates" so for example the @GetMapping {"id"} would look like
                                   // {"api/candidate/id"}
public class CandidateController {

    @Autowired
    private CandidateService candidateService; /// injects the service
    private CandidateRepository repository;

    /// 🟢 GET all candidates
    @GetMapping // @GetMapping handles get requests to the specified paths . you can directly
                // put the path at the end like @GetMapping("/api/candidates")
    public List<Candidate> getAllCandidates() {
        return candidateService.getAllCandidates();
    }

    /// 🟢 POST add a new candidate
    @PostMapping
    public Candidate createCandidate(@RequestBody Candidate candidate) { // a @Requestbody for candidates turns all
                                                                         // candidates saved in the system which are in
                                                                         // JSON format to Objects
        return candidateService.saveCandidate(candidate); /// Calls service method
    }

    /// 🟢 GET a candidate by ID
    @GetMapping("/{id}") // {id} is a path variable Maps to: http://localhost:8080/123
    public Candidate getCandidateById(@PathVariable Long id) { // @PathVariable extracts {id} from URL and converts it
                                                               // to int
        return candidateService.getCandidateById(id); /// Calls service method
        /*
         * example of an URL with {id} at the end
         * https://example.com/candidates/123
         * 123 is the actual candidate ID . the @PathVariable annotation extracts 123
         * from th URL and passes it as an argument to the getCandidateById metod
         */
    }

    /// 🟢 DELETE a candidate
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCandidate(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok("Candidate deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    /// Update candidtae
    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(
            @PathVariable Long id,
            @RequestBody Candidate updatedCandidate) {

        return repository.findById(id)
                .map(existing -> {
                    existing.setFullName(updatedCandidate.getFullName());
                    existing.setEmail(updatedCandidate.getEmail());
                    existing.setQualification(updatedCandidate.getQualification());
                    existing.setScore(updatedCandidate.getScore());
                    return ResponseEntity.ok(repository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
