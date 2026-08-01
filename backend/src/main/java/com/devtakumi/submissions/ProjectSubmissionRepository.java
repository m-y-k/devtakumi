package com.devtakumi.submissions;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectSubmissionRepository extends JpaRepository<ProjectSubmission, UUID> {
    List<ProjectSubmission> findByAssessmentId(UUID assessmentId);
    List<ProjectSubmission> findByAssessmentIdAndUserId(UUID assessmentId, UUID userId);
}
