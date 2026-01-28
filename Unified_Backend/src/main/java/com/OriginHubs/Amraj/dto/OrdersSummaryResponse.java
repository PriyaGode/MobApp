package com.OriginHubs.Amraj.dto;

public class OrdersSummaryResponse {
    private Long totalOrders;
    private Double percentageChange;
    private String comparisonPeriod;
    private String range; // daily, weekly, monthly

    public OrdersSummaryResponse() {}

    public OrdersSummaryResponse(Long totalOrders, Double percentageChange, String comparisonPeriod, String range) {
        this.totalOrders = totalOrders;
        this.percentageChange = percentageChange;
        this.comparisonPeriod = comparisonPeriod;
        this.range = range;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Double getPercentageChange() {
        return percentageChange;
    }

    public void setPercentageChange(Double percentageChange) {
        this.percentageChange = percentageChange;
    }

    public String getComparisonPeriod() {
        return comparisonPeriod;
    }

    public void setComparisonPeriod(String comparisonPeriod) {
        this.comparisonPeriod = comparisonPeriod;
    }

    public String getRange() {
        return range;
    }

    public void setRange(String range) {
        this.range = range;
    }
}
