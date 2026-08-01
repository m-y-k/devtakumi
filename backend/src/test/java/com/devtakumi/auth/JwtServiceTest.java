package com.devtakumi.auth;

import com.devtakumi.users.Role;
import com.devtakumi.users.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtProperties properties = new JwtProperties();

    public JwtServiceTest() {
        properties.setSecret("test-secret-key-at-least-256-bits-long-for-hmac-sha256-signing");
        properties.setAccessExpirationMs(900_000);
        properties.setRefreshExpirationMs(604_800_000);
        properties.setPasswordTokenExpirationMs(3_600_000);
    }

    @Test
    void generatesAndValidatesAccessToken() {
        JwtService jwtService = new JwtService(properties);
        User user = new User();
        user.setId(java.util.UUID.randomUUID());
        user.setEmail("student@test.com");
        user.setRole(Role.STUDENT);

        String token = jwtService.generateAccessToken(user);

        assertTrue(jwtService.isValid(token, TokenType.ACCESS));
        assertFalse(jwtService.isValid(token, TokenType.REFRESH));
        assertEquals("student@test.com", jwtService.extractEmail(token));
    }

    @Test
    void generatesPasswordResetToken() {
        JwtService jwtService = new JwtService(properties);
        User user = new User();
        user.setId(java.util.UUID.randomUUID());
        user.setEmail("student@test.com");
        user.setRole(Role.STUDENT);

        String token = jwtService.generateResetPasswordToken(user);

        assertTrue(jwtService.isValid(token, TokenType.RESET_PASSWORD));
        assertFalse(jwtService.isValid(token, TokenType.ACCESS));
    }
}
