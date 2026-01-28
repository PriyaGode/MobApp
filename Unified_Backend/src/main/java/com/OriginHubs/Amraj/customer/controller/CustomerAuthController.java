package com.OriginHubs.Amraj.customer.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.customer.dto.CustomerLoginRequest;
import com.OriginHubs.Amraj.customer.dto.CustomerRegisterRequest;
import com.OriginHubs.Amraj.customer.dto.CustomerForgotPasswordRequest;
import com.OriginHubs.Amraj.customer.dto.CustomerResetPasswordRequest;
import com.OriginHubs.Amraj.customer.dto.CustomerVerifyOtpRequest;
import com.OriginHubs.Amraj.config.AppConfig;
import com.OriginHubs.Amraj.model.PasswordResetToken;
import com.OriginHubs.Amraj.model.User;
import com.OriginHubs.Amraj.model.enums.OtpType;
import com.OriginHubs.Amraj.repository.PasswordResetTokenRepository;
import com.OriginHubs.Amraj.repository.UserRepository;
import com.OriginHubs.Amraj.security.JwtUtil;
import com.OriginHubs.Amraj.customer.service.CustomerEmailService;
import com.OriginHubs.Amraj.customer.service.CustomerOtpService;
import com.OriginHubs.Amraj.customer.service.ClickSendService;

@RestController
@RequestMapping("/api/customer/auth")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CustomerAuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomerEmailService emailService;

    @SuppressWarnings("unused")
    @Autowired
    private AppConfig appConfig;

    @Autowired
    private CustomerOtpService otpService;

    @SuppressWarnings("unused")
    @Autowired
    private ClickSendService clickSendService;

    // ---------------- LOGIN -----------------
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody CustomerLoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (!optionalUser.isPresent()) {
            response.put("status", HttpStatus.NOT_FOUND.value());
            response.put("message", "User not found with email: " + request.getEmail());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.put("status", HttpStatus.UNAUTHORIZED.value());
            response.put("message", "Invalid credentials");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        if (user.getEmailVerified() == null || !user.getEmailVerified()) {
            response.put("status", HttpStatus.FORBIDDEN.value());
            response.put("message", "Email not verified");
            response.put("emailVerified", false);
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

        String token = jwtUtil.generateToken(user.getEmail());

        response.put("status", HttpStatus.OK.value());
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("userId", user.getId());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("emailVerified", true);
        response.put("role", user.getRole() != null ? user.getRole() : "CUSTOMER");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ---------------- REGISTER -----------------
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody CustomerRegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());

            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();

                if (!existingUser.getEmailVerified()) {
                    otpService.generateOtp(existingUser, OtpType.EMAIL);

                    response.put("status", HttpStatus.CONFLICT.value());
                    response.put("message", "Email already exists but not verified. OTP resent to email.");
                    response.put("emailVerified", false);
                    return new ResponseEntity<>(response, HttpStatus.CONFLICT);
                }

                response.put("status", HttpStatus.CONFLICT.value());
                response.put("message", "Email already exists and verified. Please login.");
                response.put("emailVerified", true);
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }

            User user = new User();
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhone(request.getPhone());
            user.setRole(request.getRole() != null ? request.getRole() : "USER");
            user.setStatus("ACTIVE");
            user.setCreatedAt(LocalDateTime.now());
            user.setEmailVerified(false);

            userRepository.save(user);

            otpService.generateOtp(user, OtpType.EMAIL);

            response.put("status", HttpStatus.CREATED.value());
            response.put("message", "User registered successfully. OTP sent to email for verification.");
            response.put("emailVerified", false);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (Exception e) {
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("message", "Registration failed: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ---------------- SEND PHONE OTP -----------------
    @PostMapping("/send-phone-otp")
    public ResponseEntity<Map<String, Object>> sendPhoneOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        System.out.println("------------------------------checking phone " + phone);

        Map<String, Object> response = new HashMap<>();
        if (phone == null || phone.trim().isEmpty()) {
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", "Phone number is required");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Optional<User> optionalUser = userRepository.findByPhone(phone);
        User user;
        if (optionalUser.isEmpty()) {
            user = new User();
            user.setPhone(phone);
            user.setEmail(phone + "@example.com");
            user.setFullName("Unknown");
            user.setPassword("defaultPassword");
            user.setRole("USER");
            user.setStatus("ACTIVE");
            user.setCreatedAt(LocalDateTime.now());
            user.setEmailVerified(false);
            userRepository.save(user);
        } else {
            user = optionalUser.get();
        }

        otpService.generateOtp(user, OtpType.PHONE);

        response.put("status", HttpStatus.OK.value());
        response.put("message", "OTP sent successfully to " + phone);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ---------------- VERIFY PHONE OTP -----------------
    @PostMapping("/verify-phone-otp")
    public ResponseEntity<Map<String, Object>> verifyPhoneOtp(@RequestBody CustomerVerifyOtpRequest request) {
        Map<String, Object> response = new HashMap<>();

        String phone = request.getPhone();
        String otp = request.getOtp();
        System.out.println("------------------------------verifying otp " + phone + " with otp " + otp);

        if (phone == null || phone.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", "Phone and OTP are required");
            response.put("success", false);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Optional<User> optionalUser = userRepository.findByPhone(phone);
        if (optionalUser.isEmpty()) {
            response.put("status", HttpStatus.NOT_FOUND.value());
            response.put("message", "User not found for the provided phone");
            response.put("success", false);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();

        boolean verified = otpService.verifyOtp(user, otp, OtpType.PHONE);

        if (verified) {
            response.put("status", HttpStatus.OK.value());
            response.put("message", "Phone OTP verified successfully!");
            response.put("success", true);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", "Invalid or expired OTP. Please try again.");
            response.put("success", false);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // ---------------- CHECK EMAIL VERIFICATION STATUS -----------------
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmailVerified(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        if (email == null || email.trim().isEmpty()) {
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", "Email is required");
            response.put("verified", false);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            response.put("status", HttpStatus.NOT_FOUND.value());
            response.put("message", "User not found");
            response.put("verified", false);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();
        boolean verified = user.getEmailVerified() != null && user.getEmailVerified();

        response.put("status", HttpStatus.OK.value());
        response.put("verified", verified);
        response.put("message", verified ? "Email is already verified" : "Email is not verified");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ---------------- RESEND EMAIL OTP -----------------
    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, Object>> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, Object> response = new HashMap<>();

        if (email == null || email.trim().isEmpty()) {
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", "Email is required");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            response.put("status", HttpStatus.NOT_FOUND.value());
            response.put("message", "User not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();

        if (user.getEmailVerified() != null && user.getEmailVerified()) {
            response.put("status", HttpStatus.CONFLICT.value());
            response.put("message", "Email is already verified");
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        }

        otpService.generateOtp(user, OtpType.EMAIL);

        response.put("status", HttpStatus.OK.value());
        response.put("message", "OTP resent successfully to " + email);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ---------------- VERIFY EMAIL OTP -----------------
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyEmailOtp(@RequestBody CustomerVerifyOtpRequest request) {
        Map<String, Object> response = new HashMap<>();

        String email = request.getEmail();
        String otp = request.getOtp();

        if (email == null || email.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", "Email and OTP are required");
            response.put("success", false);
            response.put("emailVerified", false);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            response.put("status", HttpStatus.NOT_FOUND.value());
            response.put("message", "User not found for the provided email");
            response.put("success", false);
            response.put("emailVerified", false);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();

        boolean verified = otpService.verifyOtp(user, otp, OtpType.EMAIL);

        if (verified) {
            user.setEmailVerified(true);
            userRepository.save(user);

            response.put("status", HttpStatus.OK.value());
            response.put("message", "Email verified successfully!");
            response.put("success", true);
            response.put("emailVerified", true);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            response.put("status", HttpStatus.BAD_REQUEST.value());
            response.put("message", "Invalid or expired OTP. Please try again.");
            response.put("success", false);
            response.put("emailVerified", false);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody CustomerForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found"));
        }

        User user = userOpt.get();
        String tokenStr = UUID.randomUUID().toString();

        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(user.getId());
        token.setToken(tokenStr);
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        tokenRepository.save(token);

        String resetLink = "myapp://reset-password/" + tokenStr;
        emailService.sendEmail(user.getEmail(), "Password Reset", "Click the link: " + resetLink);

        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset link sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody CustomerResetPasswordRequest request) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(request.getToken());
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Invalid token"));
        }

        PasswordResetToken token = tokenOpt.get();
        if (token.getExpiresAt().isBefore(LocalDateTime.now()) || "USED".equals(token.getStatus())) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Token expired or already used"));
        }

        Long userId = token.getUserId();
        if (userId == null) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Invalid token data"));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found"));
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setStatus("USED");
        token.setUsedAt(LocalDateTime.now());
        tokenRepository.save(token);

        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully"));
    }

    @PostMapping("/send-reset-otp")
    public ResponseEntity<Map<String, Object>> sendResetOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Email is required"));
        }

        Optional<User> userOtp = userRepository.findByEmail(email);
        if (userOtp.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found with this email"));
        }

        otpService.generateOtp(userOtp.get(), OtpType.RESET_EMAIL);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(Map.of("success", true, "message", "OTP sent successfully to your email"));
    }

    @PostMapping("/verify-reset-email-otp")
    public ResponseEntity<Map<String, Object>> verifyResetEmailOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpCode = request.get("otp");

        if (email == null || email.isEmpty() || otpCode == null || otpCode.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Email and OTP are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        }

        boolean verified = otpService.verifyOtp(userOpt.get(), otpCode, OtpType.RESET_EMAIL);

        if (!verified) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Invalid or expired OTP"));
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "OTP verified successfully"));
    }



    // ---------------- CHANGE PASSWORD WITHOUT OLD PASSWORD -----------------
    @PostMapping("/update-password")
    public ResponseEntity<Map<String, Object>> updatePassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (email == null || email.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            response.put("success", false);
            response.put("message", "Email and new password are required.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found.");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Password updated successfully.");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ---------------- UPDATE USER PROFILE -----------------
    @PostMapping("/update-profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String phone = request.get("phone"); // identify user by phone
            String fullName = request.get("fullName");
            String email = request.get("email");

            // Validate input
            if (phone == null || phone.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Phone number is required to identify the user.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            Optional<User> userOpt = userRepository.findByPhone(phone);
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "User not found.");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }

            User user = userOpt.get();

            // Validate fullName
            if (fullName != null && fullName.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Full name cannot be empty.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Validate email format
            if (email != null && !email.trim().isEmpty()) {
                String emailPattern = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
                if (!email.matches(emailPattern)) {
                    response.put("success", false);
                    response.put("message", "Invalid email format.");
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                user.setEmail(email);
                user.setEmailVerified(false); // mark email unverified if updated
                // Optionally send OTP for email verification
                // otpService.generateOtp(user, OtpType.EMAIL);
            }

            if (fullName != null) {
                user.setFullName(fullName);
            }

            userRepository.save(user);

            response.put("success", true);
            response.put("message", "Profile updated successfully.");
            response.put("user", Map.of(
                    "phone", user.getPhone(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "emailVerified", user.getEmailVerified()
            ));

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update profile: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }




}
