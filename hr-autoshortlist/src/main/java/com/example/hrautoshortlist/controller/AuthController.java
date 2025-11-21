//AUTHENTICATION LAYER
package com.example.hrautoshortlist.controller;

import com.example.hrautoshortlist.entity.User;
import com.example.hrautoshortlist.service.AuthService;
import com.example.hrautoshortlist.security.JwtUtil;
import com.example.hrautoshortlist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//@RestController all methods called under the class with @RestCntroller return data and (not view names[HTML])
//View names are strings called by controller methods that return template pages eg return "home"
@RestController // combines @Controller + @ResponseBody (returns data , not views)
@RequestMapping("/api/auth") // All methods in this controller start with /api
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;

    // POST /api/items - creates a new item
    @PostMapping("/register") // Handles POST requests to /api/register POST meaning show
    public User register(@RequestBody User user) { // @RequestBody converts JSON request body to User objet
                                                   // automatically meaning each person(User) saved becomes an Object
                                                   // .Example JSON: {"name": "John", "email": "john@example.com"} .
                                                   // John becomes an object in the java system
        return authService.register(user); // Return saved user (converted back to JSON) because all methods under a
                                           // class with @RESTController are supposed to return data (JSON) and not
                                           // views .
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) { // @RequestBody annotation takes the JSON data sent in a web request
                                                  // and changes it into java object that your program can work with .
                                                  // makes it easier to hande data you recieve from clients such as name
                                                  // and password.
        // everythig under @RequestBody converts JSON request body to java object
        boolean ok = authService.login(user.getUsername(), user.getPassword());
        if (!ok)
            return "Invalid username or password";
        return jwtUtil.generateToken(user.getUsername()); // returns value converted to JSONS
    }

    // adding the endpoint so the frontend can call /logout
    @PostMapping("/logout") // this is us exposing our REST API endpoints /logout is the endpoint
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.ok("Logged out");
    }

}
/*
 * AuthController
 * exposes REST API endpoints for registering a user /register and Logging in to
 * get a JWT token (/login)
 * it does not perform logic .only recieves requests and deligates work
 * LINKS TO
 * AuthService(where the business logic is )
 * JwtUtil(for generating JWT tokens when login is successful)
 * UserRepository indirectly via AuthService
 * 
 * EXTRAS
 * 
 * @RequestHeader extracts specific HTTP header values
 * HttpServletRequest gives access to raw request information
 */
