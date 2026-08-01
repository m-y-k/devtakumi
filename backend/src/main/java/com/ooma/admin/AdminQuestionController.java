package com.ooma.admin;

import com.ooma.questions.Question;
import com.ooma.questions.QuestionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionController {

    private final QuestionRepository questionRepository;

    public AdminQuestionController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @PostMapping("/classes/{classId}/questions")
    public Question createQuestion(@PathVariable UUID classId, @RequestBody Question question) {
        question.setClassSessionId(classId);
        return questionRepository.save(question);
    }

    @PutMapping("/questions/{id}")
    public Question updateQuestion(@PathVariable UUID id, @RequestBody Question updates) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        question.setTitle(updates.getTitle());
        question.setStatementMarkdown(updates.getStatementMarkdown());
        question.setDifficulty(updates.getDifficulty());
        question.setStarterCodeJava(updates.getStarterCodeJava());
        question.setTestCases(updates.getTestCases());
        question.setExamples(updates.getExamples());
        question.setConstraints(updates.getConstraints());
        question.setTags(updates.getTags());
        return questionRepository.save(question);
    }

    @DeleteMapping("/questions/{id}")
    public void deleteQuestion(@PathVariable UUID id) {
        questionRepository.deleteById(id);
    }

    @PostMapping("/classes/{classId}/generate-questions")
    public List<Question> generateQuestions(@PathVariable UUID classId, @RequestBody(required = false) Object placeholder) {
        return List.of();
    }
}
