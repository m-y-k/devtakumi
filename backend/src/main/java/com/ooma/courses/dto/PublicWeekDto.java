package com.ooma.courses.dto;

import java.util.List;
import java.util.UUID;

public record PublicWeekDto(
        UUID id,
        int weekNumber,
        String title,
        List<PublicClassDto> classes
) {
}
