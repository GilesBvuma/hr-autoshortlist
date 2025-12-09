package com.example.hrautoshortlist.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "applicants")
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // we use email as login for candidates; adjust if you want username
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // stored hashed

    // optional profile fields
    private String fullName;
    private String phone;

    public Applicant() {
    }

    public Applicant(String email, String password, String fullName, String phone) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phone = phone;
    }

    // getters & setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
