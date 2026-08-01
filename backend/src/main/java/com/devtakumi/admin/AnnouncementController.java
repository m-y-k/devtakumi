package com.devtakumi.admin;

import com.devtakumi.auth.AuthUserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementController(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @GetMapping
    public List<Announcement> list(@AuthenticationPrincipal AuthUserPrincipal principal) {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }
}
