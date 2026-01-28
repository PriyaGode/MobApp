package com.OriginHubs.Amraj.customer.dto;

import java.math.BigDecimal;

public class PromoCodeValidationRequest {
    private String promoCode;
    private Long userId;
    private BigDecimal orderAmount;

    public String getPromoCode() { return promoCode; }
    public void setPromoCode(String promoCode) { this.promoCode = promoCode; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public BigDecimal getOrderAmount() { return orderAmount; }
    public void setOrderAmount(BigDecimal orderAmount) { this.orderAmount = orderAmount; }
}