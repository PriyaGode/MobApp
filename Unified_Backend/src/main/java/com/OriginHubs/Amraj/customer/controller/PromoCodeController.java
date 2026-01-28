package com.OriginHubs.Amraj.customer.controller;

import com.OriginHubs.Amraj.customer.dto.PromoCodeValidationRequest;
import com.OriginHubs.Amraj.customer.dto.PromoCodeValidationResponse;
import com.OriginHubs.Amraj.customer.service.PromoCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/promo")
public class PromoCodeController {

    @Autowired
    private PromoCodeService promoCodeService;

    @PostMapping("/validate")
    public ResponseEntity<PromoCodeValidationResponse> validatePromoCode(
            @RequestBody PromoCodeValidationRequest request) {
        
        if (request.getPromoCode() == null || request.getPromoCode().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new PromoCodeValidationResponse(false, "Please enter a promo code"));
        }
        
        if (request.getOrderAmount() == null || request.getOrderAmount().signum() <= 0) {
            return ResponseEntity.badRequest()
                .body(new PromoCodeValidationResponse(false, "Order amount is required"));
        }

        PromoCodeValidationResponse response = promoCodeService.validatePromoCode(request, request.getUserId());
        return ResponseEntity.ok(response);
    }
}