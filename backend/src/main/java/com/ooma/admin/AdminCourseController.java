package com.ooma.admin;

import com.ooma.courses.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final CourseRepository courseRepository;
    private final MonthRepository monthRepository;
    private final WeekRepository weekRepository;
    private final ClassSessionRepository classSessionRepository;

    public AdminCourseController(
            CourseRepository courseRepository,
            MonthRepository monthRepository,
            WeekRepository weekRepository,
            ClassSessionRepository classSessionRepository) {
        this.courseRepository = courseRepository;
        this.monthRepository = monthRepository;
        this.weekRepository = weekRepository;
        this.classSessionRepository = classSessionRepository;
    }

    @GetMapping("/courses")
    public java.util.List<Course> listCourses() {
        return courseRepository.findAll();
    }

    @PostMapping("/courses")
    public Course createCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    @PutMapping("/courses/{id}")
    public Course updateCourse(@PathVariable UUID id, @RequestBody Course updates) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        course.setTitle(updates.getTitle());
        course.setDescription(updates.getDescription());
        course.setPriceInr(updates.getPriceInr());
        return courseRepository.save(course);
    }

    @PostMapping("/courses/{courseId}/months")
    public Month createMonth(@PathVariable UUID courseId, @RequestBody Month month) {
        month.setCourseId(courseId);
        return monthRepository.save(month);
    }

    @PutMapping("/months/{id}")
    public Month updateMonth(@PathVariable UUID id, @RequestBody Month updates) {
        Month month = monthRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        month.setTitle(updates.getTitle());
        return monthRepository.save(month);
    }

    @PostMapping("/months/{monthId}/weeks")
    public Week createWeek(@PathVariable UUID monthId, @RequestBody Week week) {
        week.setMonthId(monthId);
        return weekRepository.save(week);
    }

    @PutMapping("/weeks/{id}")
    public Week updateWeek(@PathVariable UUID id, @RequestBody Week updates) {
        Week week = weekRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        week.setTitle(updates.getTitle());
        return weekRepository.save(week);
    }

    @PostMapping("/weeks/{weekId}/classes")
    public ClassSession createClass(@PathVariable UUID weekId, @RequestBody ClassSession session) {
        session.setWeekId(weekId);
        return classSessionRepository.save(session);
    }

    @PutMapping("/classes/{id}")
    public ClassSession updateClass(@PathVariable UUID id, @RequestBody ClassSession updates) {
        ClassSession session = classSessionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (updates.getTitle() != null) session.setTitle(updates.getTitle());
        if (updates.getNotesMarkdown() != null) session.setNotesMarkdown(updates.getNotesMarkdown());
        if (updates.getLiveMeetingUrl() != null) session.setLiveMeetingUrl(updates.getLiveMeetingUrl());
        if (updates.getScheduledStart() != null) session.setScheduledStart(updates.getScheduledStart());
        if (updates.getScheduledEnd() != null) session.setScheduledEnd(updates.getScheduledEnd());
        if (updates.getDay() != null) session.setDay(updates.getDay());
        return classSessionRepository.save(session);
    }

    @DeleteMapping("/classes/{id}")
    public void deleteClass(@PathVariable UUID id) {
        classSessionRepository.deleteById(id);
    }
}
