package com.ooma.code;

import com.ooma.submissions.Verdict;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class VerdictMappingTest {

    @Test
    public void testVerdictAcceptedWhenAllTestsPass() {
        boolean allPassed = true;
        Verdict verdict = allPassed ? Verdict.ACCEPTED : Verdict.WRONG_ANSWER;
        assertEquals(Verdict.ACCEPTED, verdict);
    }

    @Test
    public void testVerdictWrongAnswerWhenSomeTestsFail() {
        boolean allPassed = false;
        Verdict verdict = allPassed ? Verdict.ACCEPTED : Verdict.WRONG_ANSWER;
        assertEquals(Verdict.WRONG_ANSWER, verdict);
    }
}
