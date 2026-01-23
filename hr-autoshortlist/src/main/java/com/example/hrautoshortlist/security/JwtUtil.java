package com.example.hrautoshortlist.security;

//AUTHENTICATION LAYER
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
//here we create the JwtUtil bean wit @Component then we inject it at AuthController using @Autowired 
@Component
public class JwtUtil {

    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256); // in-memory key (for demo)
    private final long EXP_MS = 1000L * 60 * 60 * 24; // 24 hours

    public String generateToken(String username) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + EXP_MS))
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token).getBody().getSubject();
        } catch (JwtException e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
/*
 * JwtUtil
 * Creates JWT tokens for authenticated users
 * Extracts username from token
 * validates token expiration/signature
 * LINKS TO
 * Authcontroller (controller uses to create tokens on login)
 * JwtFilter(validates tokens on every request)
 */