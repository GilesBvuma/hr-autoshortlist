package com.example.hrautoshortlist.dto;

import java.util.List;

/**
 * DTO to parse responses received from the Gemini API.
 * Maps to Gemini's generateContent response format.
 */
public class GeminiResponse {

    private List<Candidate> candidates;
    private PromptFeedback promptFeedback;

    public List<Candidate> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<Candidate> candidates) {
        this.candidates = candidates;
    }

    public PromptFeedback getPromptFeedback() {
        return promptFeedback;
    }

    public void setPromptFeedback(PromptFeedback promptFeedback) {
        this.promptFeedback = promptFeedback;
    }

    /**
     * Convenience method: extracts the first text response from Gemini.
     * Returns null if no text is available.
     */
    public String getFirstText() {
        if (candidates == null || candidates.isEmpty())
            return null;
        Content content = candidates.get(0).getContent();
        if (content == null || content.getParts() == null || content.getParts().isEmpty())
            return null;
        return content.getParts().get(0).getText();
    }

    // -------------------------------------------------------------------------
    // Nested classes matching the Gemini response structure
    // -------------------------------------------------------------------------

    public static class Candidate {
        private Content content;
        private String finishReason;
        private int index;

        public Content getContent() {
            return content;
        }

        public void setContent(Content content) {
            this.content = content;
        }

        public String getFinishReason() {
            return finishReason;
        }

        public void setFinishReason(String finishReason) {
            this.finishReason = finishReason;
        }

        public int getIndex() {
            return index;
        }

        public void setIndex(int index) {
            this.index = index;
        }
    }

    public static class Content {
        private List<Part> parts;
        private String role;

        public List<Part> getParts() {
            return parts;
        }

        public void setParts(List<Part> parts) {
            this.parts = parts;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    public static class Part {
        private String text;

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }

    public static class PromptFeedback {
        private String blockReason;

        public String getBlockReason() {
            return blockReason;
        }

        public void setBlockReason(String blockReason) {
            this.blockReason = blockReason;
        }
    }
}
