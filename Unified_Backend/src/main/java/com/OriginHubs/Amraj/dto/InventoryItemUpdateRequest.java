package com.OriginHubs.Amraj.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InventoryItemUpdateRequest(
        @NotBlank(message = "Product name is required")
        @Size(max = 200, message = "Product name must not exceed 200 characters")
        String productName,

        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity must be 0 or greater")
        Integer quantity,

        @NotNull(message = "Reorder level is required")
        @Min(value = 0, message = "Reorder level must be 0 or greater")
        Integer reorderLevel,

        String description,

        @Min(value = 0, message = "Unit price must be 0 or greater")
        Double unitPrice,

        @Size(max = 50, message = "Unit must not exceed 50 characters")
        String unit
) {
}
