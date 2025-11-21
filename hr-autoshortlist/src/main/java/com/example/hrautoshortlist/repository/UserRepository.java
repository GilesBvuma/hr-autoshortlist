//DATA LAYER
package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
/*
 * This gives us access to
 * -save(user)
 * -findByUsername(username)
 * -findAll(), etc.
 * 
 * Interface for CRUD operations on User table
 * Spring generates implementation automatically
 * 
 * LINKS TO
 * AuthService(for login & saving user)
 * CustomerUserDetailsServices(for authentication)
 */
