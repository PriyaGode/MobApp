package com.OriginHubs.Amraj.customer.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.customer.dto.CustomerOrderResponse;
import com.OriginHubs.Amraj.customer.dto.CustomerProcessPaymentRequest;
import com.OriginHubs.Amraj.customer.service.CustomerPaymentService;

@RestController
@RequestMapping("/api/customer/payments")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CustomerPaymentController {

    @Autowired
    private CustomerPaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody CustomerProcessPaymentRequest request) {
        try {
            CustomerOrderResponse order = paymentService.processPayment(request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String orderId) {
        try {
            CustomerOrderResponse order = paymentService.getPaymentStatus(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/refund/{orderId}")
    public ResponseEntity<?> refundPayment(@PathVariable String orderId) {
        try {
            CustomerOrderResponse order = paymentService.refundPayment(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
