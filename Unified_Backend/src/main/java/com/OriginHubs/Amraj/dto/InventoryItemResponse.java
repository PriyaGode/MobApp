package com.OriginHubs.Amraj.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

import com.OriginHubs.Amraj.entity.InventoryItem;
import com.OriginHubs.Amraj.entity.enums.InventoryStatus;

public record InventoryItemResponse(
        UUID id,
        UUID hubId,
        String hubName,
        String sku,
        String productName,
        Integer quantity,
        Integer reorderLevel,
        InventoryStatus status,
        String description,
        Double unitPrice,
        String unit,
        ZonedDateTime lastRestocked,
        ZonedDateTime createdAt,
        ZonedDateTime updatedAt
) {
    public static InventoryItemResponse from(InventoryItem item) {
        return new InventoryItemResponse(
                item.getId(),
                item.getHub().getId(),
                item.getHub().getName(),
                item.getSku(),
                item.getProductName(),
                item.getQuantity(),
                item.getReorderLevel(),
                item.getStatus(),
                item.getDescription(),
                item.getUnitPrice(),
                item.getUnit(),
                item.getLastRestocked(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
