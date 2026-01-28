package com.OriginHubs.Amraj.customer.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.customer.dto.CustomerFavoriteRequest;
import com.OriginHubs.Amraj.customer.dto.CustomerFavoriteResponse;
import com.OriginHubs.Amraj.customer.service.CustomerFavoriteService;

@RestController
@RequestMapping("/api/customer/favorites")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CustomerFavoriteController {
    
    @Autowired
    private CustomerFavoriteService favoriteService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CustomerFavoriteResponse>> getUserFavorites(@PathVariable Long userId) {
        List<CustomerFavoriteResponse> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(favorites);
    }
    
    @PostMapping("/user/{userId}")
    public ResponseEntity<CustomerFavoriteResponse> addFavorite(
            @PathVariable Long userId,
            @RequestBody CustomerFavoriteRequest request) {
        CustomerFavoriteResponse response = favoriteService.addFavorite(userId, request.getProductId());
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        favoriteService.removeFavorite(userId, productId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/user/{userId}/product/{productId}/check")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        boolean isFavorite = favoriteService.isFavorite(userId, productId);
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }
}
