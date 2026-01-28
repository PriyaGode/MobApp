package com.OriginHubs.Amraj.customer.dto;

public class CustomerReviewRequest {
    private Long productId;

    private Integer rating; // 1-5
    private String comment;

    public CustomerReviewRequest() {}

    // Getters and Setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }



    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}