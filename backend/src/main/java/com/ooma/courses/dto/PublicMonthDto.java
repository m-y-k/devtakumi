package com.ooma.courses.dto;

import java.util.List;
import java.util.UUID;

public record PublicMonthDto(
        UUID id,
        int monthNumber,
        String title,
        List<PublicWeekDto> weeks
) {
}
