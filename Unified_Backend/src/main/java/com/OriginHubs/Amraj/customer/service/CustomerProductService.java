package com.OriginHubs.Amraj.customer.service;

import com.OriginHubs.Amraj.model.Product;
import com.OriginHubs.Amraj.model.Image;
import com.OriginHubs.Amraj.model.Review;
import com.OriginHubs.Amraj.repository.ProductRepository;
import com.OriginHubs.Amraj.repository.ImageRepository;
import com.OriginHubs.Amraj.repository.ReviewRepository;
import com.OriginHubs.Amraj.customer.dto.ProductWithImagesDTO;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class CustomerProductService {

    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;
    private final ReviewRepository reviewRepository;

    public CustomerProductService(ProductRepository productRepository, ImageRepository imageRepository, ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.imageRepository = imageRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<ProductWithImagesDTO> getAllProducts() {
        return productRepository.findAll().stream()
            .filter(product -> "ACTIVE".equals(product.getStatus()))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<ProductWithImagesDTO> getProductsByCategory(String category) {
        return productRepository.findAll().stream()
            .filter(product -> "ACTIVE".equals(product.getStatus()))
            .filter(product -> category.equalsIgnoreCase(product.getCategory()))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    private ProductWithImagesDTO mapToDTO(Product product) {
        List<Image> images = new ArrayList<>(imageRepository.findByReferenceTypeAndReferenceId("PRODUCT", product.getId()));
        
        // If no images, add default image based on category
        if (images.isEmpty()) {
            Image defaultImage = new Image();
            String category = product.getCategory().toLowerCase();
            if (category.contains("mango")) {
                defaultImage.setFilePath("/images/defaults/mango-default.jpg");
            } else if (category.contains("drink") || category.contains("beverage")) {
                defaultImage.setFilePath("/images/defaults/drink-default.jpg");
            } else if (category.contains("pantry")) {
                defaultImage.setFilePath("/images/defaults/pantry-default.jpg");
            } else {
                defaultImage.setFilePath("/images/defaults/product-default.jpg");
            }
            defaultImage.setIsPrimary(true);
            images.add(defaultImage);
        }
        
        ProductWithImagesDTO dto = new ProductWithImagesDTO(product, images);
        
        // Calculate rating
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        if (!reviews.isEmpty()) {
            double avgRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            dto.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
            dto.setReviewCount(reviews.size());
        }
        
        return dto;
    }
}
