package com.OriginHubs.Amraj.customer.model;

/**
 * Order status enum for Customer APIs
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    REFUNDED;
    
    /**
     * Convert from String to OrderStatus
     */
    public static OrderStatus fromString(String status) {
        if (status == null) {
            return PENDING;
        }
        try {
            return OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Handle legacy status values
            switch (status.toLowerCase()) {
                case "processing":
                    return PROCESSING;
                case "pending":
                    return PENDING;
                case "delivered":
                    return DELIVERED;
                case "cancelled":
                    return CANCELLED;
                default:
                    return PENDING;
            }
        }
    }
}
