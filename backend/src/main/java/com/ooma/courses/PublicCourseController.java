package com.ooma.courses;

import com.ooma.courses.dto.PublicCourseDetailDto;
import com.ooma.courses.dto.PublicCourseSummaryDto;
import com.ooma.courses.dto.PublicCurriculumDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/courses")
public class PublicCourseController {

    private final PublicCourseService publicCourseService;

    public PublicCourseController(PublicCourseService publicCourseService) {
        this.publicCourseService = publicCourseService;
    }

    @GetMapping
    public List<PublicCourseSummaryDto> listCourses() {
        return publicCourseService.listCourses();
    }

    @GetMapping("/{slug}")
    public PublicCourseDetailDto getCourse(@PathVariable String slug) {
        return publicCourseService.getCourse(slug);
    }

    @GetMapping("/{slug}/curriculum")
    public PublicCurriculumDto getCurriculum(@PathVariable String slug) {
        return publicCourseService.getCurriculum(slug);
    }
}
