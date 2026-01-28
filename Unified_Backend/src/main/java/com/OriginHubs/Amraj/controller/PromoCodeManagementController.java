package com.OriginHubs.Amraj.controller;

import com.OriginHubs.Amraj.model.PromoCode;
import com.OriginHubs.Amraj.repository.PromoCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promo-codes")
public class PromoCodeManagementController {

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    @GetMapping
    public ResponseEntity<List<PromoCode>> getAllPromoCodes() {
        return ResponseEntity.ok(promoCodeRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<PromoCode> createPromoCode(@RequestBody PromoCode promoCode) {
        return ResponseEntity.ok(promoCodeRepository.save(promoCode));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromoCode> updatePromoCode(@PathVariable Long id, @RequestBody PromoCode promoCode) {
        promoCode.setId(id);
        return ResponseEntity.ok(promoCodeRepository.save(promoCode));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromoCode(@PathVariable Long id) {
        promoCodeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}