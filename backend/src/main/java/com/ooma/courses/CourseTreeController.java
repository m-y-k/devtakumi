package com.ooma.courses;

import com.ooma.auth.AuthUserPrincipal;
import com.ooma.courses.dto.*;
import com.ooma.enrollment.EnrollmentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseTreeController {

    private final CourseRepository courseRepository;
    private final MonthRepository monthRepository;
    private final WeekRepository weekRepository;
    private final ClassSessionRepository classSessionRepository;
    private final EnrollmentService enrollmentService;

    public CourseTreeController(
            CourseRepository courseRepository,
            MonthRepository monthRepository,
            WeekRepository weekRepository,
            ClassSessionRepository classSessionRepository,
            EnrollmentService enrollmentService) {
        this.courseRepository = courseRepository;
        this.monthRepository = monthRepository;
        this.weekRepository = weekRepository;
        this.classSessionRepository = classSessionRepository;
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/{courseId}/tree")
    public CourseTreeDto getCourseTree(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal AuthUserPrincipal principal) {
        enrollmentService.verifyCourseAccess(principal.getId(), courseId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<MonthTreeDto> months = monthRepository.findByCourseIdOrderByMonthNumberAsc(courseId).stream()
                .map(this::toMonthTree)
                .collect(Collectors.toList());

        return new CourseTreeDto(course.getId(), course.getSlug(), course.getTitle(), months);
    }

    private MonthTreeDto toMonthTree(Month month) {
        List<WeekTreeDto> weeks = weekRepository.findByMonthIdOrderByWeekNumberAsc(month.getId()).stream()
                .map(this::toWeekTree)
                .collect(Collectors.toList());
        return new MonthTreeDto(month.getId(), month.getMonthNumber(), month.getTitle(), weeks);
    }

    private WeekTreeDto toWeekTree(Week week) {
        List<ClassTreeDto> classes = classSessionRepository.findByWeekIdOrderByOrderIndexAsc(week.getId()).stream()
                .map(c -> new ClassTreeDto(c.getId(), c.getGlobalClassNumber(), c.getTitle(), c.getDay(), c.getOrderIndex()))
                .collect(Collectors.toList());
        return new WeekTreeDto(week.getId(), week.getWeekNumber(), week.getTitle(), classes);
    }

    public record CourseTreeDto(UUID id, String slug, String title, List<MonthTreeDto> months) {}
    public record MonthTreeDto(UUID id, int monthNumber, String title, List<WeekTreeDto> weeks) {}
    public record WeekTreeDto(UUID id, int weekNumber, String title, List<ClassTreeDto> classes) {}
    public record ClassTreeDto(UUID id, int globalClassNumber, String title, com.ooma.courses.ClassDay day, int orderIndex) {}
}
