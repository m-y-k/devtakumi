package com.ooma.enrollment;

import com.ooma.auth.JwtService;
import com.ooma.auth.TokenType;
import com.ooma.courses.Course;
import com.ooma.courses.CourseRepository;
import com.ooma.email.EmailService;
import com.ooma.users.Role;
import com.ooma.users.User;
import com.ooma.users.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EnrollmentService {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentService.class);

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentRequestRepository enrollmentRequestRepository;
    private final CourseRepository courseRepository;
    private final EmailService emailService;
    private final JwtService jwtService;

    public EnrollmentService(
            UserRepository userRepository,
            EnrollmentRepository enrollmentRepository,
            EnrollmentRequestRepository enrollmentRequestRepository,
            CourseRepository courseRepository,
            EmailService emailService,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.enrollmentRequestRepository = enrollmentRequestRepository;
        this.courseRepository = courseRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    public List<EnrollmentRequest> getRequestsByStatus(EnrollmentRequestStatus status) {
        if (status != null) {
            return enrollmentRequestRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return enrollmentRequestRepository.findAll();
    }

    public List<EnrollmentRequest> getPendingRequests() {
        return enrollmentRequestRepository.findByStatusOrderByCreatedAtDesc(EnrollmentRequestStatus.PENDING);
    }

    @Transactional
    public void approveRequest(UUID requestId) {
        EnrollmentRequest request = enrollmentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment request not found"));

        if (request.getStatus() != EnrollmentRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request already " + request.getStatus());
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setName(request.getName());
                    newUser.setEmail(request.getEmail());
                    newUser.setPhone(request.getPhone());
                    newUser.setRole(Role.STUDENT);
                    newUser.setPasswordHash(null);
                    return userRepository.save(newUser);
                });

        boolean alreadyEnrolled = enrollmentRepository.findByUserId(user.getId()).stream()
                .anyMatch(e -> e.getCourseId().equals(course.getId()) && e.getStatus() == EnrollmentStatus.ACTIVE);

        if (!alreadyEnrolled) {
            Enrollment enrollment = new Enrollment();
            enrollment.setUserId(user.getId());
            enrollment.setCourseId(course.getId());
            enrollment.setStatus(EnrollmentStatus.ACTIVE);
            enrollmentRepository.save(enrollment);
        }

        request.setStatus(EnrollmentRequestStatus.APPROVED);
        request.setReviewedAt(Instant.now());
        enrollmentRequestRepository.save(request);

        String setPasswordToken = jwtService.generateSetPasswordToken(user);
        emailService.sendSetPasswordEmail(user.getEmail(), setPasswordToken);
        log.info("ENROLLMENT_APPROVED user={} courseId={} requestId={}", user.getId(), course.getId(), requestId);
    }

    @Transactional
    public void rejectRequest(UUID requestId, String note) {
        EnrollmentRequest request = enrollmentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment request not found"));

        if (request.getStatus() != EnrollmentRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request already " + request.getStatus());
        }

        request.setStatus(EnrollmentRequestStatus.REJECTED);
        request.setAdminNote(note);
        request.setReviewedAt(Instant.now());
        enrollmentRequestRepository.save(request);

        emailService.sendEnrollmentRejectedEmail(request.getEmail(), note);
        log.info("ENROLLMENT_REJECTED email={} courseId={} requestId={}", request.getEmail(), request.getCourseId(), requestId);
    }

    public List<Enrollment> getStudentEnrollments(UUID userId) {
        return enrollmentRepository.findByUserId(userId);
    }

    public boolean hasActiveEnrollment(UUID userId, UUID courseId) {
        return enrollmentRepository.findByUserId(userId).stream()
                .anyMatch(e -> e.getCourseId().equals(courseId) && e.getStatus() == EnrollmentStatus.ACTIVE);
    }

    public boolean hasCompletedEnrollment(UUID userId, UUID courseId) {
        return enrollmentRepository.findByUserId(userId).stream()
                .anyMatch(e -> e.getCourseId().equals(courseId) && e.getStatus() == EnrollmentStatus.COMPLETED);
    }

    public boolean hasAccessToCourse(UUID userId, UUID courseId) {
        return userRepository.findById(userId)
                .map(u -> u.getRole() == com.ooma.users.Role.ADMIN || enrollmentRepository.findByUserId(userId).stream()
                        .anyMatch(e -> e.getCourseId().equals(courseId)
                                && (e.getStatus() == EnrollmentStatus.ACTIVE || e.getStatus() == EnrollmentStatus.COMPLETED)))
                .orElse(false);
    }

    public void verifyCourseAccess(UUID userId, UUID courseId) {
        if (!hasAccessToCourse(userId, courseId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this course");
        }
    }
}
