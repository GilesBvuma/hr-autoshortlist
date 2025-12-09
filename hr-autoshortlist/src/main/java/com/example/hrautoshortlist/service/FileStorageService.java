package com.example.hrautoshortlist.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty())
            return null;
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = "";
        int i = original.lastIndexOf('.');
        if (i > 0)
            ext = original.substring(i);

        String filename = UUID.randomUUID().toString() + ext;
        try {
            Path target = this.uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + original, ex);
        }
    }

    public Path getFilePath(String filename) {
        return this.uploadDir.resolve(filename).normalize();
    }
}
