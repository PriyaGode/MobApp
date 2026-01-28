package com.OriginHubs.Amraj.customer.dto;

import java.time.LocalDateTime;

public class CustomerFavoriteResponse {
    private Long id;
    private Long userId;
    private Long productId;
    private CustomerFavoriteProductInfo product;
    private LocalDateTime createdAt;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    
    public CustomerFavoriteProductInfo getProduct() {
        return product;
    }
    
    public void setProduct(CustomerFavoriteProductInfo product) {
        this.product = product;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
