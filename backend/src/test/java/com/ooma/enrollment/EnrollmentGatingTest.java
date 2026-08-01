package com.ooma.enrollment;

import com.ooma.auth.JwtService;
import com.ooma.courses.Course;
import com.ooma.courses.CourseRepository;
import com.ooma.email.EmailService;
import com.ooma.users.Role;
import com.ooma.users.User;
import com.ooma.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class EnrollmentGatingTest {

    private EnrollmentService enrollmentService;
    private UserRepository userRepository;
    private EnrollmentRepository enrollmentRepository;
    private EnrollmentRequestRepository enrollmentRequestRepository;
    private CourseRepository courseRepository;
    private EmailService emailService;
    private JwtService jwtService;

    @BeforeEach
    public void setup() {
        userRepository = mock(UserRepository.class);
        enrollmentRepository = mock(EnrollmentRepository.class);
        enrollmentRequestRepository = mock(EnrollmentRequestRepository.class);
        courseRepository = mock(CourseRepository.class);
        emailService = mock(EmailService.class);
        jwtService = mock(JwtService.class);

        enrollmentService = new EnrollmentService(
                userRepository, enrollmentRepository, enrollmentRequestRepository, courseRepository, emailService, jwtService
        );
    }

    @Test
    public void testAdminHasAccessToAnyCourse() {
        UUID adminId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        User admin = new User();
        admin.setId(adminId);
        admin.setRole(Role.ADMIN);

        when(userRepository.findById(adminId)).thenReturn(Optional.of(admin));

        assertTrue(enrollmentService.hasAccessToCourse(adminId, courseId));
    }

    @Test
    public void testStudentWithActiveEnrollmentHasAccess() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        User student = new User();
        student.setId(studentId);
        student.setRole(Role.STUDENT);

        Enrollment enrollment = new Enrollment();
        enrollment.setUserId(studentId);
        enrollment.setCourseId(courseId);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByUserId(studentId)).thenReturn(List.of(enrollment));

        assertTrue(enrollmentService.hasAccessToCourse(studentId, courseId));
    }

    @Test
    public void testStudentWithoutEnrollmentHasNoAccess() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        User student = new User();
        student.setId(studentId);
        student.setRole(Role.STUDENT);

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByUserId(studentId)).thenReturn(List.of());

        assertFalse(enrollmentService.hasAccessToCourse(studentId, courseId));
    }
}
