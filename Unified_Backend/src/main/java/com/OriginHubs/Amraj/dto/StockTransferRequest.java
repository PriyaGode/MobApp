package com.OriginHubs.Amraj.dto;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockTransferRequest(
        @NotNull(message = "Source hub ID is required")
        UUID sourceHubId,

        @NotNull(message = "Destination hub ID is required")
        UUID destinationHubId,

        @NotNull(message = "SKU is required")
        String sku,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Transfer quantity must be at least 1")
        Integer quantity,

        String notes
) {
}
