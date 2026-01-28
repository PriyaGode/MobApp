package com.OriginHubs.Amraj.dto;

import java.math.BigDecimal;
import java.util.List;

public class HubPerformanceResponse {
    private List<HubStats> topHubs;

    public HubPerformanceResponse() {}

    public HubPerformanceResponse(List<HubStats> topHubs) {
        this.topHubs = topHubs;
    }

    public List<HubStats> getTopHubs() {
        return topHubs;
    }

    public void setTopHubs(List<HubStats> topHubs) {
        this.topHubs = topHubs;
    }

    public static class HubStats {
        private String hubId;
        private String hubName;
        private String location;
        private Long orderCount;
        private BigDecimal revenue;
        private BigDecimal rating;

        public HubStats() {}

        public HubStats(String hubId, String hubName, String location, Long orderCount, BigDecimal revenue, BigDecimal rating) {
            this.hubId = hubId;
            this.hubName = hubName;
            this.location = location;
            this.orderCount = orderCount;
            this.revenue = revenue;
            this.rating = rating;
        }

        public String getHubId() {
            return hubId;
        }

        public void setHubId(String hubId) {
            this.hubId = hubId;
        }

        public String getHubName() {
            return hubName;
        }

        public void setHubName(String hubName) {
            this.hubName = hubName;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public Long getOrderCount() {
            return orderCount;
        }

        public void setOrderCount(Long orderCount) {
            this.orderCount = orderCount;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }

        public BigDecimal getRating() {
            return rating;
        }

        public void setRating(BigDecimal rating) {
            this.rating = rating;
        }
    }
}
