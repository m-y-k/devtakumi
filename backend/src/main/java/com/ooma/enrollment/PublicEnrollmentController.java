package com.ooma.enrollment;

import com.ooma.storage.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/enrollment-requests")
public class PublicEnrollmentController {

    private final EnrollmentRequestRepository enrollmentRequestRepository;
    private final StorageService storageService;

    public PublicEnrollmentController(
            EnrollmentRequestRepository enrollmentRequestRepository,
            StorageService storageService) {
        this.enrollmentRequestRepository = enrollmentRequestRepository;
        this.storageService = storageService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(
            @RequestParam @NotBlank String name,
            @RequestParam @NotBlank @Email String email,
            @RequestParam @NotBlank String phone,
            @RequestParam @NotNull UUID courseId,
            @RequestParam @NotBlank String upiReference,
            @RequestParam(required = false) MultipartFile paymentScreenshot) {

        EnrollmentRequest request = new EnrollmentRequest();
        request.setName(name);
        request.setEmail(email);
        request.setPhone(phone);
        request.setCourseId(courseId);
        request.setUpiReference(upiReference);

        if (paymentScreenshot != null && !paymentScreenshot.isEmpty()) {
            String contentType = paymentScreenshot.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "error", "Only image files are allowed for payment screenshots."
                ));
            }
            String screenshotUrl = storageService.store("payment-screenshots", paymentScreenshot);
            request.setPaymentScreenshotUrl(screenshotUrl);
        }

        enrollmentRequestRepository.save(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", request.getId(),
                "status", request.getStatus().name(),
                "message", "We'll verify your payment and email your login details within 24 hours."
        ));
    }
}
