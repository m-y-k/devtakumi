package com.ooma.code;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class Judge0Service {

    private static final Logger log = LoggerFactory.getLogger(Judge0Service.class);
    private static final int JAVA_LANGUAGE_ID = 62;

    private final RestClient restClient;

    public Judge0Service(Judge0Properties props) {
        this.restClient = RestClient.create(props.getUrl());
    }

    public Judge0Result executeCode(String code, String stdin) {
        Map<String, Object> body = Map.of(
                "source_code", code,
                "language_id", JAVA_LANGUAGE_ID,
                "stdin", stdin != null ? stdin : "",
                "cpu_time_limit", "2",
                "memory_limit", "256000"
        );

        var submissionResponse = restClient.post()
                .uri("/submissions?base64_encoded=false&wait=false")
                .body(body)
                .retrieve()
                .body(SubmissionResponse.class);

        if (submissionResponse == null || submissionResponse.token() == null) {
            throw new RuntimeException("Failed to create Judge0 submission");
        }

        String token = submissionResponse.token();
        log.info("Judge0 submission created with token: {}", token);

        for (int i = 0; i < 30; i++) {
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }

            var result = restClient.get()
                    .uri("/submissions/{token}?base64_encoded=false", token)
                    .retrieve()
                    .body(Judge0Result.class);

            if (result != null && result.statusId() != null && result.statusId() >= 3) {
                log.info("Judge0 result for token {}: status={}", token, result.status());
                return result;
            }
        }

        throw new RuntimeException("Judge0 submission timed out");
    }

    public Judge0Result batchExecute(Map<String, String> testCases, String code) {
        boolean allPassed = true;
        Judge0Result lastResult = null;

        for (var entry : testCases.entrySet()) {
            String input = entry.getKey();
            String expectedOutput = entry.getValue();

            var result = executeCode(code, input);
            lastResult = result;

            String actualOutput = result.stdout() != null ? result.stdout().trim() : "";
            if (!actualOutput.equals(expectedOutput.trim())) {
                allPassed = false;
            }
        }

        if (lastResult != null) {
            return new Judge0Result(
                    lastResult.token(),
                    lastResult.stdout(),
                    lastResult.stderr(),
                    lastResult.compileOutput(),
                    lastResult.message(),
                    allPassed ? 3 : 4,
                    allPassed ? "Accepted" : "Wrong Answer",
                    lastResult.time(),
                    lastResult.memory()
            );
        }
        return null;
    }

    public record SubmissionResponse(String token) {}
    public record Judge0Result(
            String token,
            String stdout,
            String stderr,
            @JsonProperty("compile_output") String compileOutput,
            String message,
            @JsonProperty("status_id") Integer statusId,
            String status,
            String time,
            Long memory
    ) {}
}
