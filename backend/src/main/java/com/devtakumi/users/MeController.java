package com.devtakumi.users;

import com.devtakumi.auth.AuthService;
import com.devtakumi.auth.AuthUserPrincipal;
import com.devtakumi.auth.dto.UserResponse;
import com.devtakumi.enrollment.Enrollment;
import com.devtakumi.enrollment.EnrollmentRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MeController {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public MeController(UserRepository userRepository, EnrollmentRepository enrollmentRepository) {
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AuthUserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        return AuthService.toUserResponse(user);
    }

    @GetMapping("/me/enrollments")
    public List<EnrollmentSummary> enrollments(@AuthenticationPrincipal AuthUserPrincipal principal) {
        return enrollmentRepository.findByUserId(principal.getId()).stream()
                .map(this::toSummary)
                .toList();
    }

    private EnrollmentSummary toSummary(Enrollment enrollment) {
        return new EnrollmentSummary(
                enrollment.getId(),
                enrollment.getCourseId(),
                enrollment.getStatus(),
                enrollment.getEnrolledAt(),
                enrollment.getCompletedAt()
        );
    }

    public record EnrollmentSummary(
            java.util.UUID id,
            java.util.UUID courseId,
            com.devtakumi.enrollment.EnrollmentStatus status,
            java.time.Instant enrolledAt,
            java.time.Instant completedAt
    ) {
    }
}
