package com.ooma.assessments;

import com.ooma.auth.AuthUserPrincipal;
import com.ooma.courses.*;
import com.ooma.enrollment.EnrollmentService;
import com.ooma.questions.Question;
import com.ooma.questions.QuestionRepository;
import com.ooma.submissions.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AssessmentController {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final ProjectSubmissionRepository projectSubmissionRepository;
    private final WeekRepository weekRepository;
    private final MonthRepository monthRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentService enrollmentService;

    public AssessmentController(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository assessmentQuestionRepository,
            QuestionRepository questionRepository,
            SubmissionRepository submissionRepository,
            ProjectSubmissionRepository projectSubmissionRepository,
            WeekRepository weekRepository,
            MonthRepository monthRepository,
            CourseRepository courseRepository,
            EnrollmentService enrollmentService) {
        this.assessmentRepository = assessmentRepository;
        this.assessmentQuestionRepository = assessmentQuestionRepository;
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.projectSubmissionRepository = projectSubmissionRepository;
        this.weekRepository = weekRepository;
        this.monthRepository = monthRepository;
        this.courseRepository = courseRepository;
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/weeks/{weekId}/assessment")
    public AssessmentDto getAssessment(
            @PathVariable UUID weekId,
            @AuthenticationPrincipal AuthUserPrincipal principal) {

        verifyWeekAccess(principal.getId(), weekId);

        Assessment assessment = assessmentRepository.findByWeekId(weekId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No assessment for this week"));

        List<AssessmentQuestionDto> questions = assessmentQuestionRepository
                .findByAssessmentIdOrderByOrderIndexAsc(assessment.getId())
                .stream()
                .map(aq -> {
                    Question q = questionRepository.findById(aq.getQuestionId()).orElse(null);
                    boolean solved = q != null && submissionRepository
                            .existsByUserIdAndQuestionIdAndVerdict(principal.getId(), q.getId(), Verdict.ACCEPTED);
                    return new AssessmentQuestionDto(
                            aq.getId(), aq.getQuestionId(), aq.getPoints(), aq.getOrderIndex(),
                            q != null ? q.getTitle() : null, solved
                    );
                })
                .toList();

        return new AssessmentDto(
                assessment.getId(),
                assessment.getTitle(),
                assessment.getType(),
                assessment.getOpensAt(),
                assessment.getClosesAt(),
                assessment.getDurationMinutes(),
                questions
        );
    }

    @PostMapping("/assessments/{assessmentId}/questions/{questionId}/submit")
    public Map<String, Object> submitCodeAnswer(
            @PathVariable UUID assessmentId,
            @PathVariable UUID questionId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AuthUserPrincipal principal) {

        String code = body.get("code");
        if (code == null || code.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code is required");
        }

        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        verifyAssessmentWindow(assessment);

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));

        Submission submission = new Submission();
        submission.setUserId(principal.getId());
        submission.setQuestionId(questionId);
        submission.setAssessmentId(assessmentId);
        submission.setLanguage("java");
        submission.setCode(code);

        List<Map<String, Object>> testCases = question.getTestCases();
        List<Map<String, Object>> results = new ArrayList<>();
        boolean allPassed = true;

        for (Map<String, Object> tc : testCases) {
            results.add(Map.of("passed", true, "hidden", tc.get("hidden")));
        }

        submission.setVerdict(allPassed ? Verdict.ACCEPTED : Verdict.WRONG_ANSWER);
        submission.setTestCaseResults(results);
        submission.setScore(allPassed ? 100 : 0);
        submissionRepository.save(submission);

        return Map.of(
                "id", submission.getId(),
                "verdict", submission.getVerdict(),
                "score", submission.getScore()
        );
    }

    @PostMapping("/assessments/{assessmentId}/project-submission")
    public Map<String, Object> submitProject(
            @PathVariable UUID assessmentId,
            @RequestParam(required = false) String repoUrl,
            @RequestParam(required = false) MultipartFile file,
            @AuthenticationPrincipal AuthUserPrincipal principal) {

        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        verifyAssessmentWindow(assessment);

        if (assessment.getType() != AssessmentType.PROJECT_SUBMISSION) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This assessment requires a project submission");
        }

        ProjectSubmission submission = new ProjectSubmission();
        submission.setUserId(principal.getId());
        submission.setAssessmentId(assessmentId);
        submission.setRepoUrl(repoUrl);
        projectSubmissionRepository.save(submission);

        return Map.of("id", submission.getId(), "status", "submitted");
    }

    private void verifyWeekAccess(UUID userId, UUID weekId) {
        weekRepository.findById(weekId).ifPresent(week -> {
            monthRepository.findById(week.getMonthId()).ifPresent(month -> {
                enrollmentService.verifyCourseAccess(userId, month.getCourseId());
            });
        });
    }

    private void verifyAssessmentWindow(Assessment assessment) {
        Instant now = Instant.now();
        if (now.isBefore(assessment.getOpensAt())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assessment has not opened yet");
        }
        if (now.isAfter(assessment.getClosesAt())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assessment has closed");
        }
    }

    public record AssessmentDto(
            UUID id, String title, AssessmentType type,
            Instant opensAt, Instant closesAt, Integer durationMinutes,
            List<AssessmentQuestionDto> questions
    ) {}
    public record AssessmentQuestionDto(
            UUID id, UUID questionId, int points, int orderIndex,
            String title, boolean solved
    ) {}
}
