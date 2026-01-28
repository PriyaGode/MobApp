package com.OriginHubs.Amraj.customer.dto;

import com.OriginHubs.Amraj.model.Image;
import com.OriginHubs.Amraj.model.Product;
import java.util.List;
import java.util.stream.Collectors;

public class ProductWithImagesDTO {
    private Long id;
    private String name;
    private String category;
    private String variety;
    private String origin;
    private String description;
    private Double price;
    private Integer stock;
    private Double availableKg;
    private String status;
    private String hubVisibility;
    private List<String> imageUrls;
    private String primaryImageUrl;
    private Double averageRating;
    private Integer reviewCount;

    public ProductWithImagesDTO(Product product, List<Image> images) {
        this.id = product.getId();
        this.name = product.getName();
        this.category = product.getCategory();
        this.variety = product.getVariety();
        this.origin = product.getOrigin();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.stock = product.getStock();
        this.availableKg = product.getAvailableKg();
        this.status = product.getStatus();
        this.hubVisibility = product.getHubVisibility();
        this.imageUrls = images.stream().map(Image::getFilePath).collect(Collectors.toList());
        this.primaryImageUrl = images.stream()
            .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
            .map(Image::getFilePath)
            .findFirst()
            .orElse(null);
        this.averageRating = 0.0;
        this.reviewCount = 0;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public String getVariety() {
        return variety;
    }

    public String getOrigin() {
        return origin;
    }

    public String getDescription() {
        return description;
    }

    public Double getPrice() {
        return price;
    }

    public Integer getStock() {
        return stock;
    }

    public Double getAvailableKg() {
        return availableKg;
    }

    public String getStatus() {
        return status;
    }

    public String getHubVisibility() {
        return hubVisibility;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public String getPrimaryImageUrl() {
        return primaryImageUrl;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }
}
