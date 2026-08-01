package com.ooma.admin;

import com.ooma.enrollment.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/enrollment-requests")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEnrollmentController {

    private final EnrollmentService enrollmentService;
    private final EnrollmentRequestRepository enrollmentRequestRepository;

    public AdminEnrollmentController(
            EnrollmentService enrollmentService,
            EnrollmentRequestRepository enrollmentRequestRepository) {
        this.enrollmentService = enrollmentService;
        this.enrollmentRequestRepository = enrollmentRequestRepository;
    }

    @GetMapping
    public List<EnrollmentRequest> listRequests(
            @RequestParam(required = false) EnrollmentRequestStatus status) {
        if (status != null) {
            return enrollmentRequestRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return enrollmentRequestRepository.findAll();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, String>> approve(@PathVariable UUID id) {
        enrollmentService.approveRequest(id);
        return ResponseEntity.ok(Map.of("message", "Enrollment request approved"));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, String>> reject(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String note = body != null ? body.get("note") : null;
        enrollmentService.rejectRequest(id, note);
        return ResponseEntity.ok(Map.of("message", "Enrollment request rejected"));
    }
}
