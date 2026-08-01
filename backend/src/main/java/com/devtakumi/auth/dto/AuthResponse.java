package com.devtakumi.auth.dto;

public record AuthResponse(
        String accessToken,
        UserResponse user
) {
}
