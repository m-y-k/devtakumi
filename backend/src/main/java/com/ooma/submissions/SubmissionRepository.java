package com.ooma.submissions;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByUserIdAndQuestionIdOrderBySubmittedAtDesc(UUID userId, UUID questionId);
    List<Submission> findByUserIdAndAssessmentIdOrderBySubmittedAtDesc(UUID userId, UUID assessmentId);
    boolean existsByUserIdAndQuestionIdAndVerdict(UUID userId, UUID questionId, Verdict verdict);
    Optional<Submission> findTopByUserIdAndQuestionIdOrderBySubmittedAtDesc(UUID userId, UUID questionId);
}
