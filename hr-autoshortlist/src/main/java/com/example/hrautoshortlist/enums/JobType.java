package com.example.hrautoshortlist.enums;

public enum JobType {
    INTERNSHIP("Internship"),
    GRADUATE_TRAINEE("Graduate Traineeship"),
    PERMANENT("Permanent/Full-Time");

    private final String displayName;

    JobType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
