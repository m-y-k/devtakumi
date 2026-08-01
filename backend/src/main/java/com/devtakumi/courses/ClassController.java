package com.devtakumi.courses;

import com.devtakumi.auth.AuthUserPrincipal;
import com.devtakumi.enrollment.EnrollmentService;
import com.devtakumi.questions.Difficulty;
import com.devtakumi.questions.Question;
import com.devtakumi.questions.QuestionRepository;
import com.devtakumi.submissions.SubmissionRepository;
import com.devtakumi.submissions.Verdict;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final ClassSessionRepository classSessionRepository;
    private final WeekRepository weekRepository;
    private final MonthRepository monthRepository;
    private final CourseRepository courseRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final EnrollmentService enrollmentService;

    public ClassController(
            ClassSessionRepository classSessionRepository,
            WeekRepository weekRepository,
            MonthRepository monthRepository,
            CourseRepository courseRepository,
            QuestionRepository questionRepository,
            SubmissionRepository submissionRepository,
            EnrollmentService enrollmentService) {
        this.classSessionRepository = classSessionRepository;
        this.weekRepository = weekRepository;
        this.monthRepository = monthRepository;
        this.courseRepository = courseRepository;
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/{classId}")
    public ClassDetailDto getClass(
            @PathVariable UUID classId,
            @AuthenticationPrincipal AuthUserPrincipal principal) {
        ClassSession session = classSessionRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Course course = resolveCourseForSession(session);
        if (course != null) {
            enrollmentService.verifyCourseAccess(principal.getId(), course.getId());
        }

        boolean isLive = session.getScheduledStart() != null && session.getScheduledEnd() != null
                && Instant.now().isAfter(session.getScheduledStart())
                && Instant.now().isBefore(session.getScheduledEnd());

        return new ClassDetailDto(
                session.getId(),
                session.getGlobalClassNumber(),
                session.getTitle(),
                session.getDay(),
                session.getScheduledStart(),
                session.getScheduledEnd(),
                session.getNotesMarkdown(),
                isLive ? session.getLiveMeetingUrl() : null,
                isLive,
                session.getRecordingProviderVideoId() != null,
                course != null ? course.getId() : null
        );
    }

    @GetMapping("/{classId}/questions")
    public List<QuestionSummaryDto> getQuestions(
            @PathVariable UUID classId,
            @AuthenticationPrincipal AuthUserPrincipal principal) {
        ClassSession session = classSessionRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Course course = resolveCourseForSession(session);
        if (course != null) {
            enrollmentService.verifyCourseAccess(principal.getId(), course.getId());
        }

        List<Question> questions = questionRepository.findByClassSessionIdOrderByOrderIndexAsc(classId);

        return questions.stream().map(q -> {
            boolean solved = submissionRepository.existsByUserIdAndQuestionIdAndVerdict(
                    principal.getId(), q.getId(), Verdict.ACCEPTED);
            return new QuestionSummaryDto(
                    q.getId(), q.getTitle(), q.getDifficulty(), q.getOrderIndex(), solved
            );
        }).collect(Collectors.toList());
    }

    @GetMapping("/{classId}/recording-url")
    public Map<String, String> getRecordingUrl(
            @PathVariable UUID classId,
            @AuthenticationPrincipal AuthUserPrincipal principal) {
        ClassSession session = classSessionRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Course course = resolveCourseForSession(session);
        if (course != null) {
            enrollmentService.verifyCourseAccess(principal.getId(), course.getId());
        }

        if (session.getRecordingProviderVideoId() == null) {
            throw new RuntimeException("No recording available for this class");
        }

        return Map.of("url", "/api/stream/recordings/" + session.getId());
    }

    private Course resolveCourseForSession(ClassSession session) {
        return weekRepository.findById(session.getWeekId())
                .flatMap(week -> monthRepository.findById(week.getMonthId())
                        .flatMap(month -> courseRepository.findById(month.getCourseId())))
                .orElse(null);
    }

    public record ClassDetailDto(
            UUID id,
            int globalClassNumber,
            String title,
            ClassDay day,
            Instant scheduledStart,
            Instant scheduledEnd,
            String notesMarkdown,
            String liveMeetingUrl,
            boolean isLive,
            boolean hasRecording,
            UUID courseId
    ) {}

    public record QuestionSummaryDto(
            UUID id,
            String title,
            Difficulty difficulty,
            int orderIndex,
            boolean solved
    ) {}
}
