package com.example.hrautoshortlist.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class StorageService {

    private final Path root = Paths.get("uploads");

    public StorageService() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload dir", e);
        }
    }

    // returns stored filename (unique)
    public String store(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename();
        String safe = System.currentTimeMillis() + "_" + (original != null ? original.replaceAll("\\s+", "_") : "file");
        Path target = root.resolve(safe);
        file.transferTo(target.toFile());
        return safe;
    }

    public File load(String filename) {
        return root.resolve(filename).toFile();
    }
}
