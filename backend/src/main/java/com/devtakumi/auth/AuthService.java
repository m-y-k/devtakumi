package com.devtakumi.auth;

import com.devtakumi.auth.dto.AuthResponse;
import com.devtakumi.auth.dto.UserResponse;
import com.devtakumi.email.EmailService;
import com.devtakumi.users.User;
import com.devtakumi.users.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    public AuthResponse login(String email, String password) {
        String normalizedEmail = email.toLowerCase().trim();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, password));
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getPasswordHash() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please set your password using the link sent to your email");
        }

        return new AuthResponse(jwtService.generateAccessToken(user), toUserResponse(user));
    }

    public String createRefreshToken(String email) {
        User user = userRepository.findByEmailIgnoreCase(email.toLowerCase().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        return jwtService.generateRefreshToken(user);
    }

    public AuthResponse refreshAccessToken(String refreshToken) {
        if (!jwtService.isValid(refreshToken, TokenType.REFRESH)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        User user = userRepository.findById(jwtService.extractUserId(refreshToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        return new AuthResponse(jwtService.generateAccessToken(user), toUserResponse(user));
    }

    public void forgotPassword(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            if (user.getPasswordHash() != null) {
                String token = jwtService.generateResetPasswordToken(user);
                emailService.sendPasswordResetEmail(user.getEmail(), token);
            }
        });
    }

    public void resetPassword(String token, String newPassword) {
        applyPasswordToken(token, TokenType.RESET_PASSWORD, newPassword);
    }

    public void setPassword(String token, String newPassword) {
        applyPasswordToken(token, TokenType.SET_PASSWORD, newPassword);
    }

    private void applyPasswordToken(String token, TokenType type, String newPassword) {
        if (!jwtService.isValid(token, type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired token");
        }

        User user = userRepository.findById(jwtService.extractUserId(token))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired token"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }
}
