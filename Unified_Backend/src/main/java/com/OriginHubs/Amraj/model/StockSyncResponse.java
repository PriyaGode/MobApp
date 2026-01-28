package com.OriginHubs.Amraj.model;

import java.time.LocalDateTime;
import java.util.List;

public class StockSyncResponse {
    private Long productId;
    private String productName;
    private Integer totalStock;
    private List<HubStockInfo> hubStocks;
    private List<String> lowStockWarnings;
    private LocalDateTime syncedAt;

    public StockSyncResponse() {
        this.syncedAt = LocalDateTime.now();
    }

    public static class HubStockInfo {
        private String hubId;
        private String hubName;
        private String hubLocation;
        private Integer quantity;
        private Integer lowStockThreshold;
        private boolean isLowStock;

        public HubStockInfo(String hubId, String hubName, String hubLocation, Integer quantity, Integer lowStockThreshold, boolean isLowStock) {
            this.hubId = hubId;
            this.hubName = hubName;
            this.hubLocation = hubLocation;
            this.quantity = quantity;
            this.lowStockThreshold = lowStockThreshold;
            this.isLowStock = isLowStock;
        }

        public String getHubId() { return hubId; }
        public void setHubId(String hubId) { this.hubId = hubId; }
        public String getHubName() { return hubName; }
        public void setHubName(String hubName) { this.hubName = hubName; }
        public String getHubLocation() { return hubLocation; }
        public void setHubLocation(String hubLocation) { this.hubLocation = hubLocation; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public Integer getLowStockThreshold() { return lowStockThreshold; }
        public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }
        public boolean isLowStock() { return isLowStock; }
        public void setLowStock(boolean lowStock) { isLowStock = lowStock; }
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Integer getTotalStock() { return totalStock; }
    public void setTotalStock(Integer totalStock) { this.totalStock = totalStock; }
    public List<HubStockInfo> getHubStocks() { return hubStocks; }
    public void setHubStocks(List<HubStockInfo> hubStocks) { this.hubStocks = hubStocks; }
    public List<String> getLowStockWarnings() { return lowStockWarnings; }
    public void setLowStockWarnings(List<String> lowStockWarnings) { this.lowStockWarnings = lowStockWarnings; }
    public LocalDateTime getSyncedAt() { return syncedAt; }
    public void setSyncedAt(LocalDateTime syncedAt) { this.syncedAt = syncedAt; }
}
