package com.ooma.courses;

import com.ooma.courses.dto.PublicCourseSummaryDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("dev")
class PublicCourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listCoursesReturnsThreeCourses() throws Exception {
        mockMvc.perform(get("/api/public/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].slug").value("dsa-foundations"))
                .andExpect(jsonPath("$[0].priceInr").value(499))
                .andExpect(jsonPath("$[1].slug").value("backend-engineering"))
                .andExpect(jsonPath("$[1].priceInr").value(649))
                .andExpect(jsonPath("$[2].slug").value("full-stack-development"))
                .andExpect(jsonPath("$[2].priceInr").value(899));
    }

    @Test
    void dsaCurriculumHasEightyClasses() throws Exception {
        mockMvc.perform(get("/api/public/courses/dsa-foundations/curriculum"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.months", hasSize(4)))
                .andExpect(jsonPath("$.months[0].weeks[0].classes[0].globalClassNumber").value(1))
                .andExpect(jsonPath("$.months[3].weeks[3].classes[4].globalClassNumber").value(80));
    }

    @Test
    void unknownCourseReturns404() throws Exception {
        mockMvc.perform(get("/api/public/courses/unknown"))
                .andExpect(status().isNotFound());
    }
}
