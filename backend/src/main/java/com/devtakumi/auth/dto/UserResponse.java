package com.devtakumi.auth.dto;

import com.devtakumi.users.Role;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        Role role
) {
}
