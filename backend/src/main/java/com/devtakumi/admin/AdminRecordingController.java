package com.devtakumi.admin;

import com.devtakumi.courses.ClassSession;
import com.devtakumi.courses.ClassSessionRepository;
import com.devtakumi.storage.LocalVideoStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/classes/{classId}/recording")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRecordingController {

    private final ClassSessionRepository classSessionRepository;
    private final LocalVideoStorageService videoStorageService;

    public AdminRecordingController(
            ClassSessionRepository classSessionRepository,
            LocalVideoStorageService videoStorageService) {
        this.classSessionRepository = classSessionRepository;
        this.videoStorageService = videoStorageService;
    }

    @PostMapping
    public Map<String, String> uploadRecording(
            @PathVariable UUID classId,
            @RequestParam MultipartFile file) {
        ClassSession session = classSessionRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));

        String supportedTypes = file.getContentType();
        if (supportedTypes == null || !supportedTypes.startsWith("video/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only video files are allowed");
        }

        if (file.getSize() > 500 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size exceeds 500MB limit");
        }

        String key = videoStorageService.store(file);
        session.setRecordingProvider("local");
        session.setRecordingProviderVideoId(key);
        classSessionRepository.save(session);

        return Map.of("message", "Recording uploaded successfully", "key", key);
    }
}
