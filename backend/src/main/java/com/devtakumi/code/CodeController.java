package com.devtakumi.code;

import com.devtakumi.auth.AuthUserPrincipal;
import com.devtakumi.questions.Question;
import com.devtakumi.questions.QuestionRepository;
import com.devtakumi.submissions.Submission;
import com.devtakumi.submissions.SubmissionRepository;
import com.devtakumi.submissions.Verdict;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/code")
public class CodeController {

    private static final Logger log = LoggerFactory.getLogger(CodeController.class);

    private final Judge0Service judge0Service;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;

    private final Map<UUID, Long> lastRunTime = new HashMap<>();

    public CodeController(
            Judge0Service judge0Service,
            QuestionRepository questionRepository,
            SubmissionRepository submissionRepository) {
        this.judge0Service = judge0Service;
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
    }

    @PostMapping("/run")
    public Map<String, Object> run(
            @RequestBody RunRequest request,
            @AuthenticationPrincipal AuthUserPrincipal principal) {
        checkRateLimit(principal.getId());

        Question question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));

        String stdin = request.stdin() != null ? request.stdin() : "";

        Judge0Service.Judge0Result result = judge0Service.executeCode(request.code(), stdin);

        return Map.of(
                "stdout", result.stdout() != null ? result.stdout() : "",
                "stderr", result.stderr() != null ? result.stderr() : "",
                "compileOutput", result.compileOutput() != null ? result.compileOutput() : "",
                "status", result.status() != null ? result.status() : "",
                "time", result.time() != null ? result.time() : ""
        );
    }

    @PostMapping("/submit")
    public SubmitResponse submit(
            @RequestBody SubmitRequest request,
            @AuthenticationPrincipal AuthUserPrincipal principal) {
        checkRateLimit(principal.getId());

        Question question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));

        List<Map<String, Object>> testCases = question.getTestCases();
        List<Map<String, Object>> testCaseResults = new ArrayList<>();
        boolean allPassed = true;

        for (Map<String, Object> tc : testCases) {
            String input = (String) tc.get("input");
            String expectedOutput = (String) tc.get("expectedOutput");
            boolean hidden = Boolean.TRUE.equals(tc.get("hidden"));

            Judge0Service.Judge0Result result = judge0Service.executeCode(request.code(), input);
            String actualOutput = result.stdout() != null ? result.stdout().trim() : "";
            boolean passed = actualOutput.equals(expectedOutput != null ? expectedOutput.trim() : "");

            if (!passed) {
                allPassed = false;
            }

            Map<String, Object> tcResult = new HashMap<>();
            tcResult.put("passed", passed);
            tcResult.put("hidden", hidden);
            testCaseResults.add(tcResult);
        }

        Verdict verdict = allPassed ? Verdict.ACCEPTED : Verdict.WRONG_ANSWER;

        Submission submission = new Submission();
        submission.setUserId(principal.getId());
        submission.setQuestionId(question.getId());
        submission.setLanguage("java");
        submission.setCode(request.code());
        submission.setVerdict(verdict);
        submission.setTestCaseResults(testCaseResults);
        if (verdict == Verdict.ACCEPTED) {
            submission.setScore(100);
        }
        submissionRepository.save(submission);

        log.info("CODE_EXECUTION studentId={} questionId={} language={} verdict={}", 
                 principal.getId(), question.getId(), request.language(), verdict);

        return new SubmitResponse(
                submission.getId(),
                verdict,
                testCaseResults,
                submission.getSubmittedAt()
        );
    }

    private void checkRateLimit(UUID userId) {
        long now = System.currentTimeMillis();
        Long lastRun = lastRunTime.get(userId);
        if (lastRun != null && (now - lastRun) < 3000) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please wait before submitting again");
        }
        lastRunTime.put(userId, now);
    }

    public record RunRequest(UUID questionId, String language, String code, String stdin) {}
    public record SubmitRequest(UUID questionId, String language, String code) {}
    public record SubmitResponse(UUID id, Verdict verdict, List<Map<String, Object>> testCaseResults, java.time.Instant submittedAt) {}
}
