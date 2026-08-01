package com.ooma.submissions;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID userId;

    @Column(name = "question_id", columnDefinition = "CHAR(36)")
    private UUID questionId;

    @Column(name = "assessment_id", columnDefinition = "CHAR(36)")
    private UUID assessmentId;

    @Column(nullable = false, length = 50)
    private String language = "java";

    @Column(nullable = false, columnDefinition = "MEDIUMTEXT")
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Verdict verdict = Verdict.PENDING;

    private Integer score;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "test_case_results", columnDefinition = "json")
    private List<Map<String, Object>> testCaseResults;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt = Instant.now();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getQuestionId() {
        return questionId;
    }

    public void setQuestionId(UUID questionId) {
        this.questionId = questionId;
    }

    public UUID getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(UUID assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Verdict getVerdict() {
        return verdict;
    }

    public void setVerdict(Verdict verdict) {
        this.verdict = verdict;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public List<Map<String, Object>> getTestCaseResults() {
        return testCaseResults;
    }

    public void setTestCaseResults(List<Map<String, Object>> testCaseResults) {
        this.testCaseResults = testCaseResults;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }
}
