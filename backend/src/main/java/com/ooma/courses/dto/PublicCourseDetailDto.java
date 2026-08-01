package com.ooma.courses.dto;

import java.util.UUID;

public record PublicCourseDetailDto(
        UUID id,
        String slug,
        String title,
        String description,
        int priceInr,
        int durationMonths,
        int orderIndex,
        UUID prerequisiteCourseId,
        String prerequisiteCourseTitle,
        int totalClasses
) {
}
