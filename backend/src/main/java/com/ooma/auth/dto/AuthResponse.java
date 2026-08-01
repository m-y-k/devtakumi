package com.ooma.auth.dto;

public record AuthResponse(
        String accessToken,
        UserResponse user
) {
}
