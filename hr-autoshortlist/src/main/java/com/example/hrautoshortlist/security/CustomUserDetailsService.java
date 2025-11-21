//AUTHENTICTION LAYER 
package com.example.hrautoshortlist.security;

import com.example.hrautoshortlist.entity.User;
import com.example.hrautoshortlist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

//this is a Spring dependency injection when we use @Service
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    // This method loads a user by username (used by Spring Security)
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        // Convert your User entity into a Spring Security UserDetails object
        // No roles yet, so we pass an empty list
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>());
    }
}
/*
 * CustomerUserDetailsService
 * Required by spring Security
 * loads user details from DB based on username
 * Converts User entity into a UserDetails object
 * LINKS TO
 * UserRepository(retrieves user)
 * Spring Security (used by Authentcation manager)
 * JwtFilter( calls this service to authenticate token owners)
 */