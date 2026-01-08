package com.example.hrautoshortlist.repository;

import com.example.hrautoshortlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);

    User findByEmail(String email);

    User findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
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
