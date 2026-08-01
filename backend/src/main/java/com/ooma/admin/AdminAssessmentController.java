package com.ooma.admin;

import com.ooma.assessments.*;
import com.ooma.questions.Question;
import com.ooma.questions.QuestionRepository;
import com.ooma.submissions.ProjectSubmission;
import com.ooma.submissions.ProjectSubmissionRepository;
import com.ooma.submissions.Submission;
import com.ooma.submissions.SubmissionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAssessmentController {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final ProjectSubmissionRepository projectSubmissionRepository;

    public AdminAssessmentController(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository assessmentQuestionRepository,
            QuestionRepository questionRepository,
            SubmissionRepository submissionRepository,
            ProjectSubmissionRepository projectSubmissionRepository) {
        this.assessmentRepository = assessmentRepository;
        this.assessmentQuestionRepository = assessmentQuestionRepository;
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.projectSubmissionRepository = projectSubmissionRepository;
    }

    @PostMapping("/weeks/{weekId}/assessment")
    public Assessment createAssessment(@PathVariable UUID weekId, @RequestBody Assessment assessment) {
        assessment.setWeekId(weekId);
        return assessmentRepository.save(assessment);
    }

    @PutMapping("/assessments/{id}")
    public Assessment updateAssessment(@PathVariable UUID id, @RequestBody Assessment updates) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        assessment.setTitle(updates.getTitle());
        assessment.setOpensAt(updates.getOpensAt());
        assessment.setClosesAt(updates.getClosesAt());
        assessment.setDurationMinutes(updates.getDurationMinutes());
        return assessmentRepository.save(assessment);
    }

    @PostMapping("/assessments/{id}/questions")
    public AssessmentQuestion addQuestion(@PathVariable UUID id, @RequestBody AssessmentQuestion aq) {
        aq.setAssessmentId(id);
        return assessmentQuestionRepository.save(aq);
    }

    @GetMapping("/assessments/{id}/submissions")
    public List<Submission> getSubmissions(@PathVariable UUID id) {
        return submissionRepository.findAll().stream()
                .filter(s -> s.getAssessmentId() != null && s.getAssessmentId().equals(id))
                .toList();
    }

    @GetMapping("/assessments/{id}/project-submissions")
    public List<ProjectSubmission> getProjectSubmissions(@PathVariable UUID id) {
        return projectSubmissionRepository.findByAssessmentId(id);
    }

    @PostMapping("/project-submissions/{id}/grade")
    public ProjectSubmission gradeProject(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        ProjectSubmission submission = projectSubmissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        submission.setScore((Integer) body.get("score"));
        submission.setFeedback((String) body.get("feedback"));
        submission.setGradedAt(Instant.now());
        return projectSubmissionRepository.save(submission);
    }
}
