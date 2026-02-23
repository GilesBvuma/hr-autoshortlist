package com.example.hrautoshortlist.dto;

import java.util.List;

/**
 * DTO to structure requests sent to the Gemini API.
 * Maps to Gemini's generateContent request format.
 */
public class GeminiRequest {

    private List<Content> contents;

    public GeminiRequest(List<Content> contents) {
        this.contents = contents;
    }

    public List<Content> getContents() {
        return contents;
    }

    public void setContents(List<Content> contents) {
        this.contents = contents;
    }

    // -------------------------------------------------------------------------
    // Nested classes matching Gemini API structure:
    // { "contents": [ { "parts": [ { "text": "..." } ] } ] }
    // -------------------------------------------------------------------------

    public static class Content {
        private List<Part> parts;

        public Content(List<Part> parts) {
            this.parts = parts;
        }

        public List<Part> getParts() {
            return parts;
        }

        public void setParts(List<Part> parts) {
            this.parts = parts;
        }
    }

    public static class Part {
        private String text;

        public Part(String text) {
            this.text = text;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }
}
