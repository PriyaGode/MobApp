package com.OriginHubs.Amraj.customer.service;

import com.OriginHubs.Amraj.customer.dto.PromoCodeValidationRequest;
import com.OriginHubs.Amraj.customer.dto.PromoCodeValidationResponse;
import com.OriginHubs.Amraj.model.PromoCode;
import com.OriginHubs.Amraj.repository.PromoCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PromoCodeService {

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    @Autowired
    private com.OriginHubs.Amraj.repository.OrderRepository orderRepository;

    @Autowired
    private com.OriginHubs.Amraj.repository.ProductRepository productRepository;

    public PromoCodeValidationResponse validatePromoCode(PromoCodeValidationRequest request) {
        return validatePromoCode(request, null);
    }

    public PromoCodeValidationResponse validatePromoCode(PromoCodeValidationRequest request, Long userId) {
        String code = request.getPromoCode().trim().toUpperCase();
        Long requestUserId = request.getUserId();
        BigDecimal orderAmount = request.getOrderAmount();

        Optional<PromoCode> promoCodeOpt = promoCodeRepository.findByCodeAndIsActiveTrue(code);
        
        if (promoCodeOpt.isEmpty()) {
            return new PromoCodeValidationResponse(false, "Promo code not found");
        }

        PromoCode promoCode = promoCodeOpt.get();
        
        String message = "Valid promo code";
        boolean isValid = true;
        
        // Check if expired
        LocalDateTime now = LocalDateTime.now();
        if (promoCode.getValidUntil() != null && now.isAfter(promoCode.getValidUntil())) {
            message = "Expired on " + promoCode.getValidUntil().toLocalDate();
            isValid = false;
        }
        // Check if not yet valid
        else if (promoCode.getValidFrom() != null && now.isBefore(promoCode.getValidFrom())) {
            message = "Valid from " + promoCode.getValidFrom().toLocalDate();
            isValid = false;
        }
        // Check usage limit
        else if (promoCode.getUsageLimit() != null && promoCode.getUsedCount() >= promoCode.getUsageLimit()) {
            message = "Usage limit reached";
            isValid = false;
        }
        // Check per-user limit
        else if (requestUserId != null && promoCode.getPerUserLimit() != null && promoCode.getPerUserLimit() == 1 && hasUserUsedPromoCode(requestUserId, code)) {
            message = "Already used by you";
            isValid = false;
        }
        // Check minimum order amount
        else if (promoCode.getMinOrderAmount() != null && orderAmount.compareTo(promoCode.getMinOrderAmount()) < 0) {
            message = "Minimum order amount of ₹" + promoCode.getMinOrderAmount() + " required";
            isValid = false;
        }
        
        return new PromoCodeValidationResponse(isValid, message,
            promoCode.getDiscountValue(), null, promoCode.getDiscountType(), promoCode.getMinOrderAmount());
    }

    private BigDecimal calculateDiscount(PromoCode promoCode, BigDecimal orderAmount) {
        if (orderAmount == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal discount;
        
        if ("PERCENTAGE".equals(promoCode.getDiscountType())) {
            discount = orderAmount.multiply(promoCode.getDiscountValue())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = promoCode.getDiscountValue();
        }

        // Apply maximum discount limit
        if (promoCode.getMaxDiscountAmount() != null && 
            discount.compareTo(promoCode.getMaxDiscountAmount()) > 0) {
            discount = promoCode.getMaxDiscountAmount();
        }

        // Ensure discount doesn't exceed order amount
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        return discount;
    }

    public void incrementUsageCount(String code) {
        Optional<PromoCode> promoCodeOpt = promoCodeRepository.findByCodeAndIsActiveTrue(code.trim().toUpperCase());
        if (promoCodeOpt.isPresent()) {
            PromoCode promoCode = promoCodeOpt.get();
            promoCode.setUsedCount(promoCode.getUsedCount() + 1);
            promoCodeRepository.save(promoCode);
        }
    }

    private boolean hasUserUsedPromoCode(Long userId, String promoCode) {
        return orderRepository.existsByCustomerIdAndPromoCode(userId, promoCode.trim().toUpperCase());
    }
}