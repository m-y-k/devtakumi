package com.devtakumi.questions;

import com.devtakumi.auth.AuthUserPrincipal;
import com.devtakumi.courses.ClassSession;
import com.devtakumi.courses.ClassSessionRepository;
import com.devtakumi.courses.MonthRepository;
import com.devtakumi.courses.WeekRepository;
import com.devtakumi.courses.CourseRepository;
import com.devtakumi.enrollment.EnrollmentService;
import com.devtakumi.submissions.Submission;
import com.devtakumi.submissions.SubmissionRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final ClassSessionRepository classSessionRepository;
    private final WeekRepository weekRepository;
    private final MonthRepository monthRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentService enrollmentService;

    public QuestionController(
            QuestionRepository questionRepository,
            SubmissionRepository submissionRepository,
            ClassSessionRepository classSessionRepository,
            WeekRepository weekRepository,
            MonthRepository monthRepository,
            CourseRepository courseRepository,
            EnrollmentService enrollmentService) {
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.classSessionRepository = classSessionRepository;
        this.weekRepository = weekRepository;
        this.monthRepository = monthRepository;
        this.courseRepository = courseRepository;
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/{questionId}")
    public QuestionDto getQuestion(
            @PathVariable UUID questionId,
            @AuthenticationPrincipal AuthUserPrincipal principal) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        verifyAccess(principal.getId(), question);

        return new QuestionDto(
                question.getId(),
                question.getTitle(),
                question.getDifficulty(),
                question.getStatementMarkdown(),
                question.getConstraints(),
                question.getExamples(),
                question.getStarterCodeJava(),
                question.getTags(),
                question.getOrderIndex()
        );
    }

    @GetMapping("/{questionId}/submissions")
    public List<SubmissionDto> getSubmissions(
            @PathVariable UUID questionId,
            @AuthenticationPrincipal AuthUserPrincipal principal) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        verifyAccess(principal.getId(), question);

        return submissionRepository
                .findByUserIdAndQuestionIdOrderBySubmittedAtDesc(principal.getId(), questionId)
                .stream()
                .map(s -> new SubmissionDto(
                        s.getId(), s.getVerdict(), s.getScore(),
                        s.getSubmittedAt(), s.getCode()))
                .toList();
    }

    private void verifyAccess(UUID userId, Question question) {
        if (question.getClassSessionId() != null) {
            classSessionRepository.findById(question.getClassSessionId())
                    .ifPresent(session -> {
                        UUID courseId = resolveCourseId(session);
                        if (courseId != null) {
                            enrollmentService.verifyCourseAccess(userId, courseId);
                        }
                    });
        }
    }

    private UUID resolveCourseId(com.devtakumi.courses.ClassSession session) {
        return weekRepository.findById(session.getWeekId())
                .flatMap(week -> monthRepository.findById(week.getMonthId())
                        .map(month -> month.getCourseId()))
                .orElse(null);
    }

    public record QuestionDto(
            UUID id,
            String title,
            Difficulty difficulty,
            String statementMarkdown,
            List<String> constraints,
            List<java.util.Map<String, String>> examples,
            String starterCodeJava,
            List<String> tags,
            int orderIndex
    ) {}

    public record SubmissionDto(
            UUID id,
            com.devtakumi.submissions.Verdict verdict,
            Integer score,
            java.time.Instant submittedAt,
            String code
    ) {}
}
