package com.OriginHubs.Amraj.customer.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.customer.dto.CustomerReviewRequest;
import com.OriginHubs.Amraj.customer.dto.CustomerReviewResponse;
import com.OriginHubs.Amraj.model.Product;
import com.OriginHubs.Amraj.model.Review;
import com.OriginHubs.Amraj.model.User;
import com.OriginHubs.Amraj.repository.ProductRepository;
import com.OriginHubs.Amraj.repository.ReviewRepository;
import com.OriginHubs.Amraj.repository.UserRepository;

@Service
public class CustomerReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;



    @Transactional
    public CustomerReviewResponse createReview(Long userId, CustomerReviewRequest request) {
        // Validate rating
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        // Get entities
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        // Create review
        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());

        review = reviewRepository.save(review);
        return mapToResponse(review);
    }

    public List<CustomerReviewResponse> getProductReviews(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        return reviews.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CustomerReviewResponse> getUserReviews(Long userId) {
        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return reviews.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CustomerReviewResponse> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        return reviews.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private CustomerReviewResponse mapToResponse(Review review) {
        CustomerReviewResponse response = new CustomerReviewResponse();
        response.setId(review.getId());
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getFullName());
        response.setProductId(review.getProduct().getId());
        response.setProductName(review.getProduct().getName());

        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}