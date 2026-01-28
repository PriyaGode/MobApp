package com.OriginHubs.Amraj.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.dto.InvoiceResponse;
import com.OriginHubs.Amraj.model.Invoice;
import com.OriginHubs.Amraj.model.Order;
import com.OriginHubs.Amraj.repository.OrderRepository;
import com.OriginHubs.Amraj.service.EmailService;
import com.OriginHubs.Amraj.service.InvoiceService;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/generate/{orderId}")
    public ResponseEntity<?> generateInvoice(@PathVariable Long orderId) {
        try {
            Order order = orderRepository.findByIdWithDetails(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            Invoice invoice = invoiceService.generateInvoice(order);
            emailService.sendInvoiceEmail(invoice);

            return ResponseEntity.ok(Map.of(
                    "message", "Invoice generated and sent successfully",
                    "invoiceNumber", invoice.getInvoiceNumber()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getInvoiceByOrderId(@PathVariable Long orderId) {
        try {
            Invoice invoice = invoiceService.getInvoiceByOrderId(orderId);
            InvoiceResponse response = mapToResponse(invoice);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setOrderId(invoice.getOrder().getId());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setTaxAmount(invoice.getTaxAmount());
        response.setCreatedAt(invoice.getCreatedAt());
        response.setEmailSent(invoice.getEmailSent());
        return response;
    }
}