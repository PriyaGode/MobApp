package com.OriginHubs.Amraj.dto;

public class ActiveUsersResponse {
    private Long totalActiveUsers;
    private Long activeCustomers;
    private Long activeDeliveryPartners;
    private String timeRange;

    public ActiveUsersResponse() {}

    public ActiveUsersResponse(Long totalActiveUsers, Long activeCustomers, Long activeDeliveryPartners, String timeRange) {
        this.totalActiveUsers = totalActiveUsers;
        this.activeCustomers = activeCustomers;
        this.activeDeliveryPartners = activeDeliveryPartners;
        this.timeRange = timeRange;
    }

    public Long getTotalActiveUsers() {
        return totalActiveUsers;
    }

    public void setTotalActiveUsers(Long totalActiveUsers) {
        this.totalActiveUsers = totalActiveUsers;
    }

    public Long getActiveCustomers() {
        return activeCustomers;
    }

    public void setActiveCustomers(Long activeCustomers) {
        this.activeCustomers = activeCustomers;
    }

    public Long getActiveDeliveryPartners() {
        return activeDeliveryPartners;
    }

    public void setActiveDeliveryPartners(Long activeDeliveryPartners) {
        this.activeDeliveryPartners = activeDeliveryPartners;
    }

    public String getTimeRange() {
        return timeRange;
    }

    public void setTimeRange(String timeRange) {
        this.timeRange = timeRange;
    }
}
