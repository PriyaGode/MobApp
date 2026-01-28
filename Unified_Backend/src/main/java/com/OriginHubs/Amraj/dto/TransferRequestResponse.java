package com.OriginHubs.Amraj.dto;

import java.time.LocalDateTime;

import com.OriginHubs.Amraj.entity.enums.TransferStatus;

public class TransferRequestResponse {
    private String id;
    private String requestId;
    private String sourceHubName;
    private String sourceHubCode;
    private String destinationHubName;
    private String destinationHubCode;
    private String sku;
    private String itemName;
    private Integer quantity;
    private TransferStatus status;
    private String requestedBy;
    private String approvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String notes;

    // Constructors
    public TransferRequestResponse() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getSourceHubName() { return sourceHubName; }
    public void setSourceHubName(String sourceHubName) { this.sourceHubName = sourceHubName; }

    public String getSourceHubCode() { return sourceHubCode; }
    public void setSourceHubCode(String sourceHubCode) { this.sourceHubCode = sourceHubCode; }

    public String getDestinationHubName() { return destinationHubName; }
    public void setDestinationHubName(String destinationHubName) { this.destinationHubName = destinationHubName; }

    public String getDestinationHubCode() { return destinationHubCode; }
    public void setDestinationHubCode(String destinationHubCode) { this.destinationHubCode = destinationHubCode; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public TransferStatus getStatus() { return status; }
    public void setStatus(TransferStatus status) { this.status = status; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}