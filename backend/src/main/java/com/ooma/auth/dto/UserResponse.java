package com.ooma.auth.dto;

import com.ooma.users.Role;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        Role role
) {
}
