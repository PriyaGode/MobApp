package com.OriginHubs.Amraj.customer.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.customer.dto.CustomerUpdateProfileRequest;
import com.OriginHubs.Amraj.customer.dto.CustomerUserProfileResponse;
import com.OriginHubs.Amraj.model.User;
import com.OriginHubs.Amraj.customer.service.CustomerUserService;

@RestController
@RequestMapping("/api/customer/users")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CustomerUserController {

    private final CustomerUserService userService;

    public CustomerUserController(CustomerUserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            CustomerUserProfileResponse response = new CustomerUserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getEmailVerified()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("status", 404);
            return ResponseEntity.status(404).body(error);
        }
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody CustomerUpdateProfileRequest request) {
        try {
            User user = userService.getUserById(userId);
            
            if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
                user.setFullName(request.getFullName());
            }
            
            if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
                user.setPhone(request.getPhone());
            }
            
            User updatedUser = userService.updateUser(user);
            
            CustomerUserProfileResponse response = new CustomerUserProfileResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getPhone(),
                updatedUser.getEmailVerified()
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Profile updated successfully");
            result.put("user", response);
            result.put("status", 200);
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("status", 404);
            return ResponseEntity.status(404).body(error);
        }
    }
}
