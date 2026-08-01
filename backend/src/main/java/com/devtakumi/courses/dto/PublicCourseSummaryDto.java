package com.devtakumi.courses.dto;

import java.util.UUID;

public record PublicCourseSummaryDto(
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
