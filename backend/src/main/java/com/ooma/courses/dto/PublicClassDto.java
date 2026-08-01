package com.ooma.courses.dto;

import com.ooma.courses.ClassDay;

import java.util.List;
import java.util.UUID;

public record PublicClassDto(
        UUID id,
        int globalClassNumber,
        String title,
        ClassDay day,
        int orderIndex
) {
}
