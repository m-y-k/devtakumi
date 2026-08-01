package com.ooma.courses;

import com.ooma.courses.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PublicCourseService {

    private final CourseRepository courseRepository;
    private final MonthRepository monthRepository;
    private final WeekRepository weekRepository;
    private final ClassSessionRepository classSessionRepository;

    public PublicCourseService(
            CourseRepository courseRepository,
            MonthRepository monthRepository,
            WeekRepository weekRepository,
            ClassSessionRepository classSessionRepository) {
        this.courseRepository = courseRepository;
        this.monthRepository = monthRepository;
        this.weekRepository = weekRepository;
        this.classSessionRepository = classSessionRepository;
    }

    public List<PublicCourseSummaryDto> listCourses() {
        List<Course> courses = courseRepository.findAll().stream()
                .sorted(Comparator.comparingInt(Course::getOrderIndex))
                .toList();

        Map<UUID, String> titlesById = new HashMap<>();
        for (Course course : courses) {
            titlesById.put(course.getId(), course.getTitle());
        }

        return courses.stream()
                .map(course -> toSummary(course, titlesById, countClassesForCourse(course.getId())))
                .toList();
    }

    public PublicCourseDetailDto getCourse(String slug) {
        Course course = findBySlug(slug);
        Map<UUID, String> titlesById = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle));

        return new PublicCourseDetailDto(
                course.getId(),
                course.getSlug(),
                course.getTitle(),
                course.getDescription(),
                course.getPriceInr(),
                course.getDurationMonths(),
                course.getOrderIndex(),
                course.getPrerequisiteCourseId(),
                course.getPrerequisiteCourseId() != null
                        ? titlesById.get(course.getPrerequisiteCourseId())
                        : null,
                countClassesForCourse(course.getId())
        );
    }

    public PublicCurriculumDto getCurriculum(String slug) {
        Course course = findBySlug(slug);
        List<PublicMonthDto> months = monthRepository.findByCourseIdOrderByMonthNumberAsc(course.getId()).stream()
                .map(this::toMonthDto)
                .toList();

        return new PublicCurriculumDto(course.getId(), course.getSlug(), course.getTitle(), months);
    }

    private Course findBySlug(String slug) {
        return courseRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    private PublicMonthDto toMonthDto(Month month) {
        List<PublicWeekDto> weeks = weekRepository.findByMonthIdOrderByWeekNumberAsc(month.getId()).stream()
                .map(this::toWeekDto)
                .toList();
        return new PublicMonthDto(month.getId(), month.getMonthNumber(), month.getTitle(), weeks);
    }

    private PublicWeekDto toWeekDto(Week week) {
        List<PublicClassDto> classes = classSessionRepository.findByWeekIdOrderByOrderIndexAsc(week.getId()).stream()
                .map(this::toClassDto)
                .toList();
        return new PublicWeekDto(week.getId(), week.getWeekNumber(), week.getTitle(), classes);
    }

    private PublicClassDto toClassDto(ClassSession session) {
        return new PublicClassDto(
                session.getId(),
                session.getGlobalClassNumber(),
                session.getTitle(),
                session.getDay(),
                session.getOrderIndex()
        );
    }

    private PublicCourseSummaryDto toSummary(Course course, Map<UUID, String> titlesById, int totalClasses) {
        return new PublicCourseSummaryDto(
                course.getId(),
                course.getSlug(),
                course.getTitle(),
                course.getDescription(),
                course.getPriceInr(),
                course.getDurationMonths(),
                course.getOrderIndex(),
                course.getPrerequisiteCourseId(),
                course.getPrerequisiteCourseId() != null
                        ? titlesById.get(course.getPrerequisiteCourseId())
                        : null,
                totalClasses
        );
    }

    private int countClassesForCourse(UUID courseId) {
        List<UUID> weekIds = monthRepository.findByCourseIdOrderByMonthNumberAsc(courseId).stream()
                .flatMap(month -> weekRepository.findByMonthIdOrderByWeekNumberAsc(month.getId()).stream())
                .map(Week::getId)
                .toList();
        if (weekIds.isEmpty()) {
            return 0;
        }
        return (int) classSessionRepository.countByWeekIdIn(weekIds);
    }
}
