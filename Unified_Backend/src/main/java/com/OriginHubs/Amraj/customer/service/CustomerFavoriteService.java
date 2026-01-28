package com.OriginHubs.Amraj.customer.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.customer.dto.CustomerFavoriteProductInfo;
import com.OriginHubs.Amraj.customer.dto.CustomerFavoriteResponse;
import com.OriginHubs.Amraj.model.Favorite;
import com.OriginHubs.Amraj.model.Product;
import com.OriginHubs.Amraj.repository.FavoriteRepository;
import com.OriginHubs.Amraj.repository.ProductRepository;

@Service
public class CustomerFavoriteService {
    
    @Autowired
    private FavoriteRepository favoriteRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public List<CustomerFavoriteResponse> getUserFavorites(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        return favorites.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public CustomerFavoriteResponse addFavorite(Long userId, Long productId) {
        // Check if already exists
        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            // Return existing favorite
            Favorite existing = favoriteRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));
            return convertToResponse(existing);
        }
        
        // Verify product exists
        productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setProductId(productId);
        
        Favorite saved = favoriteRepository.save(favorite);
        return convertToResponse(saved);
    }
    
    @Transactional
    public void removeFavorite(Long userId, Long productId) {
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
    }
    
    public boolean isFavorite(Long userId, Long productId) {
        return favoriteRepository.existsByUserIdAndProductId(userId, productId);
    }
    
    private CustomerFavoriteResponse convertToResponse(Favorite favorite) {
        CustomerFavoriteResponse response = new CustomerFavoriteResponse();
        response.setId(favorite.getId());
        response.setUserId(favorite.getUserId());
        response.setProductId(favorite.getProductId());
        response.setCreatedAt(favorite.getCreatedAt());
        
        // Fetch product details
        productRepository.findById(favorite.getProductId()).ifPresent(product -> {
            response.setProduct(convertProductToResponse(product));
        });
        
        return response;
    }
    
    private CustomerFavoriteProductInfo convertProductToResponse(Product product) {
        CustomerFavoriteProductInfo productResponse = new CustomerFavoriteProductInfo();
        productResponse.setId(product.getId());
        productResponse.setName(product.getName());
        productResponse.setPrice(product.getPrice());
        productResponse.setCardImage(product.getImageUrl());
        productResponse.setVariety(product.getVariety());
        // Note: Weight is not in Product model, using availableKg as string
        if (product.getAvailableKg() != null) {
            productResponse.setWeight(product.getAvailableKg() + " kg");
        }
        // Note: Rating is not in Product model, you may need to add it or calculate it
        productResponse.setRating(4.5); // Default rating for now
        return productResponse;
    }
}
