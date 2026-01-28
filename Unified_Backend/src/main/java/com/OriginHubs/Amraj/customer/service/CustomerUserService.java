package com.OriginHubs.Amraj.customer.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.OriginHubs.Amraj.model.User;
import com.OriginHubs.Amraj.repository.UserRepository;

@Service
public class CustomerUserService {

    private final UserRepository userRepository;

    public CustomerUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Find user by email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Save or update user
    public User saveUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        return userRepository.save(user);
    }

    // Mark user as verified
    public User verifyUserEmail(User user) {
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    // Check if email already exists
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    // Get user by ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // Update user profile
    public User updateUser(User user) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("User and user ID cannot be null");
        }
        // Verify user exists
        userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + user.getId()));
        return userRepository.save(user);
    }
}
