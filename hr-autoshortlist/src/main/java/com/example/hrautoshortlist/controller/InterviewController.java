package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.dto.InterviewRequestDTO;
import com.example.hrautoshortlist.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, Integer>> sendInvitations(@RequestBody InterviewRequestDTO request) {
        Map<String, Integer> result = interviewService.sendInvitations(request);
        return ResponseEntity.ok(result);
    }
}
