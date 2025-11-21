//DATA LAYER
package com.example.hrautoshortlist.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters & Setters
    public Long getId() {    //its getId only because we cant set our own Id it is generated in line 11 @GeneratedValue
        return id;
    }

    public String getUsername() {  //get the username which we wouldve set
        return username;
    }

    public void setUsername(String username) { //set the user name you want 
        this.username = username;
    }

    public String getPassword() {              //get the password we want
        return password;
    }

    public void setPassword(String password) { //set the password you want 
        this.password = password;
    }
}
/*
 * Represents a user record in the database
 * Contains username + hashed password + optional roles
 * 
 * LINKS TO
 * user repository 
 * AuthService(used in registration & login)
 * CustomerUserDetailedService
 */