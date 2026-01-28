package com.OriginHubs.Amraj.customer.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.customer.dto.CustomerOrderResponse;
import com.OriginHubs.Amraj.customer.dto.CustomerProcessPaymentRequest;
import com.OriginHubs.Amraj.customer.model.PaymentMethod;
import com.OriginHubs.Amraj.customer.model.PaymentStatus;
import com.OriginHubs.Amraj.model.Order;
import com.OriginHubs.Amraj.model.Payment;
import com.OriginHubs.Amraj.repository.OrderRepository;
import com.OriginHubs.Amraj.repository.PaymentRepository;

@Service
public class CustomerPaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerOrderService orderService;

    @Autowired
    private com.OriginHubs.Amraj.service.InvoiceService invoiceService;

    @Autowired
    private com.OriginHubs.Amraj.service.EmailService emailService;

    private final Random random = new Random();

    @Transactional
    public CustomerOrderResponse processPayment(CustomerProcessPaymentRequest request) {
        try {
            Long orderId = Long.parseLong(request.getOrderId());
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + request.getOrderId()));

            // Parse payment method
            PaymentMethod paymentMethod = PaymentMethod.fromString(request.getPaymentMethod());

            // Create payment
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(request.getAmount());
            payment.setPaymentMethod(paymentMethod.name());
            payment.setStatus(PaymentStatus.PENDING.name());
            payment.setCreatedAt(OffsetDateTime.now());

            // Set payment-specific details
            if (paymentMethod == PaymentMethod.CREDIT_CARD || paymentMethod == PaymentMethod.DEBIT_CARD) {
                if (request.getCardNumber() != null && request.getCardNumber().length() >= 4) {
                    payment.setCardLast4digits(request.getCardNumber().substring(request.getCardNumber().length() - 4));
                }
            } else if (paymentMethod == PaymentMethod.UPI) {
                payment.setUpiId(request.getUpiId());
            } else if (paymentMethod == PaymentMethod.NET_BANKING) {
                payment.setBankName(request.getBankName());
            }

            // Simulate payment gateway processing
            boolean paymentSuccess = simulatePaymentGateway(paymentMethod);

            if (paymentSuccess) {
                payment.setStatus(PaymentStatus.SUCCESS.name());
                order.setStatus("CONFIRMED");
                
                // Save payment and order first
                payment = paymentRepository.save(payment);
                orderRepository.save(order);
                
                // Generate invoice after successful payment (without sending email)
                try {
                    invoiceService.generateInvoice(order);
                } catch (Exception e) {
                    System.err.println("Failed to generate invoice: " + e.getMessage());
                }
            } else {
                payment.setStatus(PaymentStatus.FAILED.name());
                payment.setFailureReason(getRandomFailureReason());
                payment.setErrorCode(getRandomErrorCode());
                order.setStatus("CANCELLED");
                
                // Save payment and order
                payment = paymentRepository.save(payment);
                orderRepository.save(order);
            }

            return orderService.getOrderByOrderId(String.valueOf(order.getId()));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid order ID format: " + request.getOrderId());
        }
    }

    public CustomerOrderResponse getPaymentStatus(String orderId) {
        return orderService.getOrderByOrderId(orderId);
    }

    @Transactional
    public CustomerOrderResponse refundPayment(String orderId) {
        try {
            Long id = Long.parseLong(orderId);
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            // Find payment by order
            Payment payment = paymentRepository.findByOrder(order)
                    .orElseThrow(() -> new RuntimeException("No payment found for this order"));

            PaymentStatus currentStatus = PaymentStatus.fromString(payment.getStatus());
            if (currentStatus != PaymentStatus.SUCCESS) {
                throw new RuntimeException("Can only refund successful payments");
            }

            payment.setStatus(PaymentStatus.REFUNDED.name());
            order.setStatus("REFUNDED");

            paymentRepository.save(payment);
            orderRepository.save(order);

            return orderService.getOrderByOrderId(orderId);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid order ID format: " + orderId);
        }
    }

    private boolean simulatePaymentGateway(PaymentMethod method) {
        // Cash on delivery always succeeds
        if (method == PaymentMethod.CASH_ON_DELIVERY) {
            return true;
        }

        // Simulate 85% success rate for other payment methods
        return random.nextDouble() > 0.15;
    }

    private String getRandomFailureReason() {
        String[] reasons = {
                "Insufficient funds in account",
                "Transaction declined by bank",
                "Card expired or blocked",
                "Network timeout during transaction",
                "Invalid card details",
                "Transaction limit exceeded",
                "3D Secure authentication failed",
                "Bank server not responding"
        };
        return reasons[random.nextInt(reasons.length)];
    }

    private String getRandomErrorCode() {
        String[] codes = {
                "ERR_INSUFFICIENT_FUNDS",
                "ERR_CARD_DECLINED",
                "ERR_INVALID_CARD",
                "ERR_NETWORK_TIMEOUT",
                "ERR_BANK_SERVER",
                "ERR_CARD_BLOCKED",
                "ERR_TRANSACTION_LIMIT",
                "ERR_3DS_FAILED"
        };
        return codes[random.nextInt(codes.length)];
    }
}
