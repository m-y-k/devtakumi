package com.ooma.config;

import com.ooma.courses.Course;
import com.ooma.courses.CourseRepository;
import com.ooma.enrollment.Enrollment;
import com.ooma.enrollment.EnrollmentRepository;
import com.ooma.enrollment.EnrollmentStatus;
import com.ooma.users.Role;
import com.ooma.users.User;
import com.ooma.users.UserRepository;
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
        userRepository.findByEmailIgnoreCase("admin@ooma.local").ifPresentOrElse(
            admin -> {},
            () -> {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@ooma.local");
                admin.setPasswordHash(passwordEncoder.encode("admin12345"));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }
        );

        // 2. Seed Student Shezan
        seedStudent("Shezan", "shezan@ooma.dev", "Password@123");

        // 3. Seed Student Arham
        seedStudent("Arham", "arham@ooma.dev", "Password@123");
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
