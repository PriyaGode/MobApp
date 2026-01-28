package com.OriginHubs.Amraj.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class OrderDetailsDto {
    private Long id;
    private String customerName;
    private String productName; // legacy single product (kept null for dashboard)
    private String productImageUrl;
    private String hubName;
    private String deliveryPartnerName;
    private String status;
    // New: granular delivery stage (pending, processing, in-transit, out-for-delivery, delivered, cancelled)
    private String deliveryStage;
    private OffsetDateTime createdAt;
    private boolean issueFlag;
    private BigDecimal totalAmount;

    // Additional fields for details view only
    private String placedByUserName; // from orders.user_id -> users.full_name
    private String paymentMethod;    // from payments.payment_method
    private String paymentId;        // from payments.transaction_id
    // New: all product names for this order (derived from order_items join products)
    private java.util.List<String> productNames;
    // Optional: full ordered list of delivery steps for timeline UI (oldest -> newest)
    private java.util.List<String> deliverySteps;

    public OrderDetailsDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }
    public String getHubName() { return hubName; }
    public void setHubName(String hubName) { this.hubName = hubName; }
    public String getDeliveryPartnerName() { return deliveryPartnerName; }
    public void setDeliveryPartnerName(String deliveryPartnerName) { this.deliveryPartnerName = deliveryPartnerName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDeliveryStage() { return deliveryStage; }
    public void setDeliveryStage(String deliveryStage) { this.deliveryStage = deliveryStage; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public boolean isIssueFlag() { return issueFlag; }
    public void setIssueFlag(boolean issueFlag) { this.issueFlag = issueFlag; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getPlacedByUserName() { return placedByUserName; }
    public void setPlacedByUserName(String placedByUserName) { this.placedByUserName = placedByUserName; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public java.util.List<String> getProductNames() { return productNames; }
    public void setProductNames(java.util.List<String> productNames) { this.productNames = productNames; }
    public java.util.List<String> getDeliverySteps() { return deliverySteps; }
    public void setDeliverySteps(java.util.List<String> deliverySteps) { this.deliverySteps = deliverySteps; }
}
