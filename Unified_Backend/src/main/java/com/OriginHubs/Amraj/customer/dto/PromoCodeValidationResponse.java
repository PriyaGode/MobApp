package com.OriginHubs.Amraj.customer.dto;

import java.math.BigDecimal;

public class PromoCodeValidationResponse {
    private boolean valid;
    private String message;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String discountType;
    private BigDecimal minOrderAmount;

    public PromoCodeValidationResponse(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }

    public PromoCodeValidationResponse(boolean valid, String message, BigDecimal discountAmount, 
                                     BigDecimal finalAmount, String discountType, BigDecimal minOrderAmount) {
        this.valid = valid;
        this.message = message;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.discountType = discountType;
        this.minOrderAmount = minOrderAmount;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }
}