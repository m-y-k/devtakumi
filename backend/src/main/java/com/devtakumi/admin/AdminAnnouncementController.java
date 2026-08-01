package com.devtakumi.admin;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/announcements")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnnouncementController {

    private final AnnouncementRepository announcementRepository;

    public AdminAnnouncementController(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @PostMapping
    public Announcement create(@RequestBody Announcement announcement) {
        return announcementRepository.save(announcement);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable UUID id) {
        announcementRepository.deleteById(id);
        return Map.of("message", "Announcement deleted");
    }
}
