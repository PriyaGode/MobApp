package com.OriginHubs.Amraj.service;

import java.time.OffsetDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.dto.OrderDetailsDto;
import com.OriginHubs.Amraj.dto.OrderSummaryDto;
import com.OriginHubs.Amraj.model.DeliveryPartner;
import com.OriginHubs.Amraj.model.Order;
import com.OriginHubs.Amraj.model.OrderDeliveryStep;
import com.OriginHubs.Amraj.model.Payment;
import com.OriginHubs.Amraj.repository.DeliveryPartnerRepository;
import com.OriginHubs.Amraj.repository.OrderDeliveryStepRepository;
import com.OriginHubs.Amraj.repository.OrderRepository;
import com.OriginHubs.Amraj.repository.PaymentRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final OrderDeliveryStepRepository orderDeliveryStepRepository;

    public OrderService(OrderRepository orderRepository, PaymentRepository paymentRepository, DeliveryPartnerRepository deliveryPartnerRepository, OrderDeliveryStepRepository orderDeliveryStepRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.orderDeliveryStepRepository = orderDeliveryStepRepository;
    }

    public OrderDetailsDto updateOrderDeliveryPartner(Long orderId, Long deliveryPartnerId) {
        var orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) throw new IllegalArgumentException("Order not found: " + orderId);
        var order = orderOpt.get();
        DeliveryPartner dp = null;
        if (deliveryPartnerId != null) {
            dp = deliveryPartnerRepository.findById(deliveryPartnerId)
                    .orElseThrow(() -> new IllegalArgumentException("Delivery partner not found: " + deliveryPartnerId));
        }
        order.setDeliveryPartner(dp);
        orderRepository.save(order);
        return getOrderDetails(orderId);
    }

    public OrderDetailsDto updateOrderStatus(Long orderId, String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        String normalized = status.trim().toLowerCase();
        // Canonicalize underscore variants to hyphen style used internally
        if ("in_transit".equals(normalized)) normalized = "in-transit";
        if ("out_for_delivery".equals(normalized)) normalized = "out-for-delivery";
        // Accept confirmed lifecycle stage now added to flow
        if ("confirmed".equals(normalized)) {
            // no transformation needed
        }
        // Validate full lifecycle statuses
        boolean valid = switch (normalized) {
            case "pending", "confirmed", "processing", "in-transit", "out-for-delivery", "delivered", "cancelled" -> true;
            default -> false;
        };
        if (!valid) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        // Store full lifecycle state directly (no aggregation) to preserve distinct stages including 'confirmed'
        order.setStatus(normalized);
        // Persist granular delivery step (avoid duplicating identical latest step)
        var latestOpt = orderDeliveryStepRepository.findTopByOrder_IdOrderByTimestampDesc(orderId);
        if (latestOpt.isEmpty() || !latestOpt.get().getStep().equals(normalized)) {
            OrderDeliveryStep stepEntity = new OrderDeliveryStep();
            stepEntity.setOrder(order);
            stepEntity.setStep(normalized);
            stepEntity.setTimestamp(OffsetDateTime.now());
            orderDeliveryStepRepository.save(stepEntity);
        }
        orderRepository.save(order);
        return getOrderDetails(orderId);
    }
    public Page<OrderSummaryDto> findOrders(String status,
                                            java.util.UUID hubId,
                                            Long deliveryPartnerId,
                                            Boolean issue,
                                            OffsetDateTime from,
                                            OffsetDateTime to,
                                            String search,
                                            Pageable pageable) {

        // Interpret search as a numeric order id (exact match) when possible
        Long searchId = null;
        if (search != null) {
            String s = search.trim();
            if (!s.isEmpty()) {
                try { searchId = Long.valueOf(s); } catch (NumberFormatException ignored) {}
            }
        }

        // Start with a neutral (always true) specification and chain conditions; avoids deprecated where(null) usage.
        Specification<Order> spec = (root, query, cb) -> cb.conjunction();
        spec = spec
            .and(OrderSpecifications.hasStatus(status))
            .and(OrderSpecifications.hasHubId(hubId))
            .and(OrderSpecifications.hasDeliveryPartnerId(deliveryPartnerId))
            .and(OrderSpecifications.hasIssueFlag(issue))
            .and(OrderSpecifications.createdAfter(from))
            .and(OrderSpecifications.createdBefore(to));

        if (searchId != null) {
            final Long fSearchId = searchId;
            spec = spec.and((root, query, cb) -> cb.equal(root.get("id"), fSearchId));
        }

        // Use entity graph version of findAll to avoid N+1 for associated single-valued relations
        Page<Order> page = orderRepository.findAll(spec, pageable);
        return page.map(o -> new OrderSummaryDto(
            o.getId(),
            o.getCustomer() != null ? o.getCustomer().getFullName() : null,
            o.getHub() != null ? o.getHub().getName() : null,
            o.getDeliveryPartner() != null ? o.getDeliveryPartner().getName() : null,
            o.getStatus(),
            o.getCreatedAt(),
            o.isIssueFlag(),
            o.getTotalAmount()
        ));
    }

    @Transactional(readOnly = true)
    public OrderDetailsDto getOrderDetails(Long id) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Use ArrayList with initial capacity to prevent resizing
        java.util.List<String> productNames = new java.util.ArrayList<>(10);
        if (order.getOrderItems() != null) {
            order.getOrderItems().forEach(item -> {
                if (item.getProduct() != null && item.getProduct().getName() != null) {
                    productNames.add(item.getProduct().getName());
                }
            });
        }

        String placedByUserName = order.getCustomer() != null ? 
            order.getCustomer().getFullName() : null;

        Payment pay = paymentRepository.findTopByOrder_IdOrderByCreatedAtDesc(order.getId())
            .orElse(null);

        OrderDetailsDto dto = new OrderDetailsDto();
        dto.setId(order.getId());
        dto.setCustomerName(order.getCustomer() != null ? order.getCustomer().getFullName() : null);
        dto.setProductNames(productNames);
        dto.setHubName(order.getHub() != null ? order.getHub().getName() : null);
        dto.setDeliveryPartnerName(order.getDeliveryPartner() != null ? order.getDeliveryPartner().getName() : null);
        dto.setStatus(order.getStatus());
        
        var stepsAsc = orderDeliveryStepRepository.findByOrder_IdOrderByTimestampAsc(order.getId());
        if (!stepsAsc.isEmpty()) {
            String latest = stepsAsc.get(stepsAsc.size() - 1).getStep();
            dto.setDeliveryStage(latest);
            java.util.List<String> all = stepsAsc.stream()
                .map(OrderDeliveryStep::getStep)
                .collect(java.util.stream.Collectors.toList());
            dto.setDeliverySteps(all);
        } else {
            dto.setDeliveryStage("pending");
            dto.setDeliverySteps(java.util.List.of("pending"));
        }
        
        dto.setCreatedAt(order.getCreatedAt());
        dto.setIssueFlag(order.isIssueFlag());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setPlacedByUserName(placedByUserName);
        
        if (pay != null) {
            dto.setPaymentMethod(pay.getPaymentMethod());
            dto.setPaymentId(String.valueOf(pay.getId()));
        }
        
        return dto;
    }
}
