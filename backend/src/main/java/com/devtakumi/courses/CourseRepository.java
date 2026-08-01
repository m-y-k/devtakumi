package com.devtakumi.courses;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {

    Optional<Course> findBySlug(String slug);
    Optional<Course> findByPrerequisiteCourseId(UUID prerequisiteCourseId);
}
