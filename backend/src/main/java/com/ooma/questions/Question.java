package com.ooma.questions;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @Column(name = "class_session_id", columnDefinition = "CHAR(36)")
    private UUID classSessionId;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(name = "statement_markdown", nullable = false, columnDefinition = "MEDIUMTEXT")
    private String statementMarkdown;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> constraints;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "json")
    private List<Map<String, String>> examples;

    @Column(name = "starter_code_java", columnDefinition = "MEDIUMTEXT")
    private String starterCodeJava;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "test_cases", nullable = false, columnDefinition = "json")
    private List<Map<String, Object>> testCases;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> tags;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getClassSessionId() {
        return classSessionId;
    }

    public void setClassSessionId(UUID classSessionId) {
        this.classSessionId = classSessionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getStatementMarkdown() {
        return statementMarkdown;
    }

    public void setStatementMarkdown(String statementMarkdown) {
        this.statementMarkdown = statementMarkdown;
    }

    public List<String> getConstraints() {
        return constraints;
    }

    public void setConstraints(List<String> constraints) {
        this.constraints = constraints;
    }

    public List<Map<String, String>> getExamples() {
        return examples;
    }

    public void setExamples(List<Map<String, String>> examples) {
        this.examples = examples;
    }

    public String getStarterCodeJava() {
        return starterCodeJava;
    }

    public void setStarterCodeJava(String starterCodeJava) {
        this.starterCodeJava = starterCodeJava;
    }

    public List<Map<String, Object>> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<Map<String, Object>> testCases) {
        this.testCases = testCases;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }
}
