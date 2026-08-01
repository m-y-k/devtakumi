package com.devtakumi.auth;

import com.devtakumi.users.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class JwtService {

    private static final List<String> INSECURE_SECRETS = List.of(
            "change-me-to-a-long-random-secret-at-least-256-bits",
            "change-me-in-production-to-a-long-random-secret"
    );

    private final JwtProperties properties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        if (INSECURE_SECRETS.contains(properties.getSecret())) {
            throw new IllegalStateException(
                    "JWT_SECRET is set to a known insecure placeholder. Generate a strong random secret and set JWT_SECRET.");
        }
        if (properties.getSecret().getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 256 bits (32+ bytes). Generate a strong random secret and set JWT_SECRET.");
        }
        this.secretKey = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        return buildToken(user, TokenType.ACCESS, properties.getAccessExpirationMs());
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, TokenType.REFRESH, properties.getRefreshExpirationMs());
    }

    public String generateResetPasswordToken(User user) {
        return buildToken(user, TokenType.RESET_PASSWORD, properties.getPasswordTokenExpirationMs());
    }

    public String generateSetPasswordToken(User user) {
        return buildToken(user, TokenType.SET_PASSWORD, properties.getPasswordTokenExpirationMs());
    }

    private String buildToken(User user, TokenType type, long expirationMs) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("type", type.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(secretKey)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token, TokenType expectedType) {
        try {
            Claims claims = parseClaims(token);
            String type = claims.get("type", String.class);
            return expectedType.name().equals(type) && claims.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }
}
