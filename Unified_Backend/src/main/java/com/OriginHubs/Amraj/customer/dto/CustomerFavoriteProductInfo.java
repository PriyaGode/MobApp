package com.OriginHubs.Amraj.customer.dto;

public class CustomerFavoriteProductInfo {
    private Long id;
    private String name;
    private Double price;
    private String cardImage;
    private String variety;
    private String weight;
    private Double rating;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Double getPrice() {
        return price;
    }
    
    public void setPrice(Double price) {
        this.price = price;
    }
    
    public String getCardImage() {
        return cardImage;
    }
    
    public void setCardImage(String cardImage) {
        this.cardImage = cardImage;
    }
    
    public String getVariety() {
        return variety;
    }
    
    public void setVariety(String variety) {
        this.variety = variety;
    }
    
    public String getWeight() {
        return weight;
    }
    
    public void setWeight(String weight) {
        this.weight = weight;
    }
    
    public Double getRating() {
        return rating;
    }
    
    public void setRating(Double rating) {
        this.rating = rating;
    }
}
