package com.devtakumi.admin;

import com.devtakumi.courses.Course;
import com.devtakumi.courses.CourseRepository;
import com.devtakumi.email.EmailService;
import com.devtakumi.enrollment.*;
import com.devtakumi.users.User;
import com.devtakumi.users.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final EmailService emailService;

    public AdminStudentController(
            UserRepository userRepository,
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.emailService = emailService;
    }

    @GetMapping
    public List<StudentDto> listStudents() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.devtakumi.users.Role.STUDENT)
                .map(u -> {
                    List<Enrollment> enrollments = enrollmentRepository.findByUserId(u.getId());
                    return new StudentDto(u.getId(), u.getName(), u.getEmail(), u.getPhone(), enrollments);
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public StudentDto getStudent(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());
        return new StudentDto(user.getId(), user.getName(), user.getEmail(), user.getPhone(), enrollments);
    }

    @PostMapping("/{studentId}/enrollments/{courseId}/complete")
    public Map<String, String> markCourseComplete(
            @PathVariable UUID studentId,
            @PathVariable UUID courseId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(studentId);
        Enrollment enrollment = enrollments.stream()
                .filter(e -> e.getCourseId().equals(courseId) && e.getStatus() == EnrollmentStatus.ACTIVE)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Active enrollment not found"));

        enrollment.setStatus(EnrollmentStatus.COMPLETED);
        enrollment.setCompletedAt(Instant.now());
        enrollmentRepository.save(enrollment);

        User student = userRepository.findById(studentId).orElse(null);
        Course completedCourse = courseRepository.findById(courseId).orElse(null);

        courseRepository.findByPrerequisiteCourseId(courseId).ifPresent(nextCourse -> {
            boolean alreadyEnrolled = enrollments.stream()
                    .anyMatch(e -> e.getCourseId().equals(nextCourse.getId())
                            && e.getStatus() == EnrollmentStatus.ACTIVE);
            if (!alreadyEnrolled && student != null) {
                Enrollment nextEnrollment = new Enrollment();
                nextEnrollment.setUserId(studentId);
                nextEnrollment.setCourseId(nextCourse.getId());
                nextEnrollment.setStatus(EnrollmentStatus.ACTIVE);
                enrollmentRepository.save(nextEnrollment);
                emailService.sendCourseUnlockedEmail(student.getEmail(), nextCourse.getTitle());
            }
        });

        return Map.of("message", "Course marked as completed");
    }

    @PostMapping("/{studentId}/enrollments")
    public Enrollment grantEnrollment(
            @PathVariable UUID studentId,
            @RequestBody Map<String, UUID> body) {
        UUID courseId = body.get("courseId");
        if (courseId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "courseId is required");
        }
        Enrollment enrollment = new Enrollment();
        enrollment.setUserId(studentId);
        enrollment.setCourseId(courseId);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        return enrollmentRepository.save(enrollment);
    }

    public record StudentDto(UUID id, String name, String email, String phone, List<Enrollment> enrollments) {}
}
