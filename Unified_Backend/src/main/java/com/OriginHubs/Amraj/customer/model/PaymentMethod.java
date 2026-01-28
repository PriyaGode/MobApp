package com.OriginHubs.Amraj.customer.model;

/**
 * Payment method enum for Customer APIs
 */
public enum PaymentMethod {
    CREDIT_CARD,
    DEBIT_CARD,
    UPI,
    NET_BANKING,
    CASH_ON_DELIVERY,
    WALLET;
    
    public static PaymentMethod fromString(String method) {
        if (method == null) {
            return CASH_ON_DELIVERY;
        }
        try {
            return PaymentMethod.valueOf(method.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return CASH_ON_DELIVERY;
        }
    }
}
