package com.OriginHubs.Amraj.customer.model;

/**
 * Payment status enum for Customer APIs
 */
public enum PaymentStatus {
    PENDING,
    SUCCESS,
    FAILED,
    REFUNDED,
    CANCELLED;
    
    public static PaymentStatus fromString(String status) {
        if (status == null) {
            return PENDING;
        }
        try {
            return PaymentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PENDING;
        }
    }
}
