package com.OriginHubs.Amraj.customer.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CustomerOrderTrackingResponse {

    public static class TrackingStatus {
        private String id;
        private String title;
        private String timestamp;
        private String icon;
        private boolean completed;
        private boolean current;

        public TrackingStatus(String id, String title, String timestamp, String icon, boolean completed, boolean current) {
            this.id = id;
            this.title = title;
            this.timestamp = timestamp;
            this.icon = icon;
            this.completed = completed;
            this.current = current;
        }

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }

        public boolean isCompleted() {
            return completed;
        }

        public void setCompleted(boolean completed) {
            this.completed = completed;
        }

        public boolean isCurrent() {
            return current;
        }

        public void setCurrent(boolean current) {
            this.current = current;
        }
    }

    public static class DeliveryInfo {
        private String driverName;
        private String driverPhone;
        private String driverAvatar;
        private String vehicleNumber;
        private double currentLatitude;
        private double currentLongitude;
        private int estimatedTimeMinutes;

        // Getters and Setters
        public String getDriverName() {
            return driverName;
        }

        public void setDriverName(String driverName) {
            this.driverName = driverName;
        }

        public String getDriverPhone() {
            return driverPhone;
        }

        public void setDriverPhone(String driverPhone) {
            this.driverPhone = driverPhone;
        }

        public String getDriverAvatar() {
            return driverAvatar;
        }

        public void setDriverAvatar(String driverAvatar) {
            this.driverAvatar = driverAvatar;
        }

        public String getVehicleNumber() {
            return vehicleNumber;
        }

        public void setVehicleNumber(String vehicleNumber) {
            this.vehicleNumber = vehicleNumber;
        }

        public double getCurrentLatitude() {
            return currentLatitude;
        }

        public void setCurrentLatitude(double currentLatitude) {
            this.currentLatitude = currentLatitude;
        }

        public double getCurrentLongitude() {
            return currentLongitude;
        }

        public void setCurrentLongitude(double currentLongitude) {
            this.currentLongitude = currentLongitude;
        }

        public int getEstimatedTimeMinutes() {
            return estimatedTimeMinutes;
        }

        public void setEstimatedTimeMinutes(int estimatedTimeMinutes) {
            this.estimatedTimeMinutes = estimatedTimeMinutes;
        }
    }

    private String orderId;
    private String currentStatus;
    private LocalDateTime orderDate;
    private LocalDateTime estimatedDelivery;
    private String deliveryAddress;
    private List<TrackingStatus> statuses;
    private DeliveryInfo deliveryInfo;

    // Getters and Setters
    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDateTime getEstimatedDelivery() {
        return estimatedDelivery;
    }

    public void setEstimatedDelivery(LocalDateTime estimatedDelivery) {
        this.estimatedDelivery = estimatedDelivery;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public List<TrackingStatus> getStatuses() {
        return statuses;
    }

    public void setStatuses(List<TrackingStatus> statuses) {
        this.statuses = statuses;
    }

    public DeliveryInfo getDeliveryInfo() {
        return deliveryInfo;
    }

    public void setDeliveryInfo(DeliveryInfo deliveryInfo) {
        this.deliveryInfo = deliveryInfo;
    }
}
