package com.example.hrautoshortlist.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration class for Gemini AI API integration.
 * Reads API key and URL from application.properties.
 */
@Configuration
public class GeminiConfig {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    /**
     * Provides the Gemini API key to beans that need it.
     */
    @Bean(name = "geminiApiKey")
    public String geminiApiKey() {
        return apiKey;
    }

    /**
     * Provides the Gemini API URL.
     */
    @Bean(name = "geminiApiUrl")
    public String geminiApiUrl() {
        return apiUrl;
    }

    /**
     * RestTemplate bean for making HTTP requests to Gemini API.
     * A separate bean avoids conflicts with other RestTemplate definitions.
     */
    @Bean(name = "geminiRestTemplate")
    public RestTemplate geminiRestTemplate() {
        return new RestTemplate();
    }
}
