package com.OriginHubs.Amraj.controller;

import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.repository.UserRepository;

import lombok.Data;

@RestController
@RequestMapping("/api/admin/auth")
public class AuthController {

    @Data
    public static class LoginRequest {
        private String email;
        private String password;

        // Explicit getters in case Lombok processing is unavailable in some environments
        public String getEmail() { return email; }
        public String getPassword() { return password; }
    }

    private static final Pattern BCRYPT_PATTERN = Pattern.compile("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() || request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "email and password required"));
        }
        String normalizedEmail = request.getEmail().toLowerCase();

        // TEMP: bypass validation for admin@amraj.com
        if ("admin@amraj.com".equals(normalizedEmail)) {
            return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "userId", -1,
                "email", normalizedEmail,
                "fullName", "Super Admin",
                "role", "SUPER_ADMIN"
            ));
        }
        return userRepository.findByEmail(normalizedEmail)
                .map(user -> {
                    if (user.getPassword() == null) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                        "error", "invalid credentials",
                                        "authenticated", false
                                ));
                    }
                    boolean ok = passwordMatches(user.getPassword(), request.getPassword());
                    if (!ok) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                        "error", "invalid credentials",
                                        "authenticated", false
                                ));
                    }
                    return ResponseEntity.ok(Map.of(
                            "authenticated", true,
                            "userId", user.getId(),
                            "email", user.getEmail(),
                            "fullName", user.getFullName(),
                            "role", user.getRole() != null ? user.getRole().toString() : "CUSTOMER"
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "invalid credentials", "authenticated", false)));
    }

    private boolean passwordMatches(String stored, String provided) {
        if (stored == null || provided == null) return false;
        // Detect bcrypt hash
        if (BCRYPT_PATTERN.matcher(stored).matches()) {
            try {
                return BCrypt.checkpw(provided, stored);
            } catch (IllegalArgumentException e) {
                return false;
            }
        }
        // Fallback: constant‑time plain text compare
        if (stored.length() != provided.length()) return false;
        int result = 0;
        for (int i = 0; i < stored.length(); i++) {
            result |= stored.charAt(i) ^ provided.charAt(i);
        }
        return result == 0;
    }
}
