package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller // Marks this class asa web request handler meaning its meant to return view names(templats) like home.html and not JSON data(returns view names)
public class HomeController {

    @Autowired
    private CandidateService candidateService;

    @GetMapping("/") // Handles HTTP GET requests to the specified path ("/")
    public String home() {
        return "home"; // This will look for home.html under /resources/templates . Returns view name
                       // "home" -> looks for home.html
    }

    @GetMapping("/candidates")
    public String candidates(Model model) { // Spring injects Model object to pass data to view
        model.addAttribute("candidates", candidateService.getAllCandidates()); // adds data to the Model
        return "candidates";
    }
}
