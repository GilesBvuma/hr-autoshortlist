package com.example.hrautoshortlist.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            String firebaseConfig = System.getenv("FIREBASE_SERVICE_ACCOUNT");
            InputStream serviceAccount;

            if (firebaseConfig != null && !firebaseConfig.isEmpty()) {
                // Initialize from environment variable (useful for Render/Heroku)
                serviceAccount = new java.io.ByteArrayInputStream(
                        firebaseConfig.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            } else {
                // Fallback to classpath resource (useful for local development)
                ClassPathResource resource = new ClassPathResource("serviceAccountKey.json");
                if (!resource.exists()) {
                    throw new IOException("Firebase service account key not found in environment or classpath.");
                }
                serviceAccount = resource.getInputStream();
            }

            try (serviceAccount) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                return FirebaseApp.initializeApp(options);
            }
        }
        return FirebaseApp.getInstance();
    }
}
