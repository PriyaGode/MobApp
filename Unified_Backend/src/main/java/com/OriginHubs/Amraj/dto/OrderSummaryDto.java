package com.OriginHubs.Amraj.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

// Manual DTO (removed Lombok to avoid annotation processing issues in current environment)
public class OrderSummaryDto {
	public static class Builder {
		private Long id;
		private String customerName;
		private String productName;
		private String productImageUrl;
		private String hubName;
		private String deliveryPartnerName;
		private String status;
		private OffsetDateTime createdAt;
		private boolean issueFlag;
		private BigDecimal totalAmount;

		public Builder id(Long id) { this.id = id; return this; }
		public Builder customerName(String v) { this.customerName = v; return this; }
		public Builder productName(String v) { this.productName = v; return this; }
		public Builder productImageUrl(String v) { this.productImageUrl = v; return this; }
		public Builder hubName(String v) { this.hubName = v; return this; }
		public Builder deliveryPartnerName(String v) { this.deliveryPartnerName = v; return this; }
		public Builder status(String v) { this.status = v; return this; }
		public Builder createdAt(OffsetDateTime v) { this.createdAt = v; return this; }
		public Builder issueFlag(boolean v) { this.issueFlag = v; return this; }
		public Builder totalAmount(BigDecimal v) { this.totalAmount = v; return this; }
		public OrderSummaryDto build() { return new OrderSummaryDto(this); }
	}
	public static Builder builder() { return new Builder(); }
	private Long id;
	private String customerName;
	private String productName;
	private String productImageUrl;
	private String hubName; // currently null (hub relation removed)
	private String deliveryPartnerName;
	private String status;
	private OffsetDateTime createdAt;

	private boolean issueFlag;

	private BigDecimal totalAmount;

	public OrderSummaryDto() {}

	// JPQL constructor projection for summary list queries
	public OrderSummaryDto(
		Long id,
		String customerName,
		String hubName,
		String deliveryPartnerName,
		String status,
		OffsetDateTime createdAt,
		boolean issueFlag,
		BigDecimal totalAmount
	) {
		this.id = id;
		this.customerName = customerName;
		this.hubName = hubName;
		this.deliveryPartnerName = deliveryPartnerName;
		this.status = status;
		this.createdAt = createdAt;
		this.issueFlag = issueFlag;
		this.totalAmount = totalAmount;
	}

	private OrderSummaryDto(Builder b) {
		this.id = b.id;
		this.customerName = b.customerName;
		this.productName = b.productName;
		this.productImageUrl = b.productImageUrl;
		this.hubName = b.hubName;
		this.deliveryPartnerName = b.deliveryPartnerName;
		this.status = b.status;
		this.createdAt = b.createdAt;
		this.issueFlag = b.issueFlag;
		this.totalAmount = b.totalAmount;
	}

	// Getters
	public Long getId() { return id; }
	public String getCustomerName() { return customerName; }
	public String getProductName() { return productName; }
	public String getProductImageUrl() { return productImageUrl; }
	public String getHubName() { return hubName; }
	public String getDeliveryPartnerName() { return deliveryPartnerName; }
	public String getStatus() { return status; }
	public OffsetDateTime getCreatedAt() { return createdAt; }
	public boolean isIssueFlag() { return issueFlag; }
	public BigDecimal getTotalAmount() { return totalAmount; }
}
