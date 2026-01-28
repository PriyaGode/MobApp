package com.OriginHubs.Amraj.controller;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.dto.OrderDetailsDto;
import com.OriginHubs.Amraj.dto.OrderSummaryDto;
import com.OriginHubs.Amraj.entity.enums.AuditActionType;
import com.OriginHubs.Amraj.service.AuditLogService;
import com.OriginHubs.Amraj.service.OrderService;

@RestController
@RequestMapping("/api/admin/orders")
public class OrderController {

    public static class UpdateDeliveryPartnerRequest {
        private Long deliveryPartnerId;
        public Long getDeliveryPartnerId() { return deliveryPartnerId; }
        public void setDeliveryPartnerId(Long deliveryPartnerId) { this.deliveryPartnerId = deliveryPartnerId; }
    }

    public static class UpdateStatusRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    private final OrderService orderService;
    private final AuditLogService auditLogService;

    public OrderController(OrderService orderService, AuditLogService auditLogService) {
        this.orderService = orderService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public Page<OrderSummaryDto> getOrders(@RequestParam(required = false) String status,
                                           @RequestParam(required = false) UUID hub,
                                           @RequestParam(required = false, name = "deliveryPartner") Long deliveryPartner,
                                           @RequestParam(required = false) Boolean issue,
                                           @RequestParam(required = false) String dateFrom,
                                           @RequestParam(required = false) String dateTo,
                                           @RequestParam(required = false) String dateRange,
                                           @RequestParam(required = false) String search,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size,
                                           @RequestParam(required = false) String sort) {

        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        OffsetDateTime from = parseDate(dateFrom);
        OffsetDateTime to = parseDate(dateTo);

        if ((from == null && to == null) && dateRange != null && !dateRange.isBlank()) {
            OffsetDateTime[] range = parseDateRange(dateRange);
            if (range != null) {
                from = range[0];
                to = range[1];
            }
        }

        return orderService.findOrders(status, hub, deliveryPartner, issue, from, to, search, pageable);
    }

    @GetMapping("/{id}")
    public OrderDetailsDto getOrder(@PathVariable Long id) {
        return orderService.getOrderDetails(id);
    }

    @PatchMapping("/{id}/delivery-partner")
    public OrderDetailsDto updateDeliveryPartner(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
                                                 @PathVariable Long id,
                                                 @RequestBody UpdateDeliveryPartnerRequest request) {
        OrderDetailsDto before = orderService.getOrderDetails(id);
        OrderDetailsDto updated = orderService.updateOrderDeliveryPartner(id, request != null ? request.getDeliveryPartnerId() : null);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.ORDER_MODIFICATION, "Order", String.valueOf(id), null, null, null, "API", "INFO", "Updated delivery partner for order " + id, before, updated, request, null);
        }
        return updated;
    }

    @PatchMapping("/{id}/status")
    public OrderDetailsDto updateStatus(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
                                        @PathVariable Long id,
                                        @RequestBody UpdateStatusRequest request) {
        OrderDetailsDto before = orderService.getOrderDetails(id);
        OrderDetailsDto updated = orderService.updateOrderStatus(id, request != null ? request.getStatus() : null);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.ORDER_STATUS_CHANGED, "Order", String.valueOf(id), null, null, null, "API", "INFO", "Changed order status for order " + id + " to " + updated.getStatus(), before, updated, request, null);
        }
        return updated;
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        // expected format field,dir e.g. createdAt,asc
        String[] parts = sort.split(",");
        String field = parts[0];
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, field);
    }

    private OffsetDateTime parseDate(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return OffsetDateTime.parse(raw);
        } catch (DateTimeParseException e) {
            return null; // ignore invalid format, could log
        }
    }

    // Accepts "from..to" or "from,to"; both endpoints parsed with OffsetDateTime.parse
    private OffsetDateTime[] parseDateRange(String range) {
        if (range == null || range.isBlank()) return null;
        String[] parts = range.contains("..") ? range.split("\\.\\.") : range.split(",");
        if (parts.length != 2) return null;
        OffsetDateTime start = parseDate(parts[0].trim());
        OffsetDateTime end = parseDate(parts[1].trim());
        if (start == null && end == null) return null;
        return new OffsetDateTime[] { start, end };
    }
}
