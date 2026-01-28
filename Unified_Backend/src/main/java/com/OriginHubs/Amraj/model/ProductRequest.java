package com.OriginHubs.Amraj.model;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ProductRequest {
    @NotEmpty(message = "Product name cannot be empty")
    private String name;
    private String category;
    private String variety;
    private String origin;
    private String description;
    @NotNull(message = "Price cannot be null")
    @Positive(message = "Price must be greater than 0")
    private Double price;
    private Integer stock;
    private Integer availableKg;
    private String imageUrl;
    private String status;
    private String hubVisibility;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getVariety() { return variety; }
    public void setVariety(String variety) { this.variety = variety; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Integer getAvailableKg() { return availableKg; }
    public void setAvailableKg(Integer availableKg) { this.availableKg = availableKg; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getHubVisibility() { return hubVisibility; }
    public void setHubVisibility(String hubVisibility) { this.hubVisibility = hubVisibility; }
}
