package com.devtakumi.courses.dto;

import java.util.List;
import java.util.UUID;

public record PublicCurriculumDto(
        UUID courseId,
        String slug,
        String title,
        List<PublicMonthDto> months
) {
}
