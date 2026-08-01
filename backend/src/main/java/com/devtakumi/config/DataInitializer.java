package com.devtakumi.config;

import com.devtakumi.courses.Course;
import com.devtakumi.courses.CourseRepository;
import com.devtakumi.enrollment.Enrollment;
import com.devtakumi.enrollment.EnrollmentRepository;
import com.devtakumi.enrollment.EnrollmentStatus;
import com.devtakumi.users.Role;
import com.devtakumi.users.User;
import com.devtakumi.users.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CourseRepository courseRepository,
                           EnrollmentRepository enrollmentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Admin
        userRepository.findByEmailIgnoreCase("admin@devtakumi.local").ifPresentOrElse(
            admin -> {},
            () -> {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@devtakumi.local");
                admin.setPasswordHash(passwordEncoder.encode("admin12345"));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }
        );

        // 2. Seed Student Shezan
        seedStudent("Shezan", "shezan@devtakumi.dev", "Password@123");

        // 3. Seed Student Arham
        seedStudent("Arham", "arham@devtakumi.dev", "Password@123");
    }

    private void seedStudent(String name, String email, String rawPassword) {
        User student = userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            User u = new User();
            u.setName(name);
            u.setEmail(email);
            u.setRole(Role.STUDENT);
            return u;
        });

        student.setPasswordHash(passwordEncoder.encode(rawPassword));
        User savedUser = userRepository.save(student);

        // Enroll in all available courses
        List<Course> courses = courseRepository.findAll();
        List<Enrollment> existingEnrollments = enrollmentRepository.findByUserId(savedUser.getId());
        for (Course course : courses) {
            boolean alreadyEnrolled = existingEnrollments.stream()
                    .anyMatch(e -> e.getCourseId().equals(course.getId()));
            if (!alreadyEnrolled) {
                Enrollment e = new Enrollment();
                e.setUserId(savedUser.getId());
                e.setCourseId(course.getId());
                e.setStatus(EnrollmentStatus.ACTIVE);
                enrollmentRepository.save(e);
            }
        }
    }
}
