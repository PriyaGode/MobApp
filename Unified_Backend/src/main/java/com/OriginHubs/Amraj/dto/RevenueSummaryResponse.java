package com.OriginHubs.Amraj.dto;

import java.math.BigDecimal;

public class RevenueSummaryResponse {
    private BigDecimal totalRevenue;
    private Double percentageChange;
    private String comparisonPeriod;
    private String range;

    public RevenueSummaryResponse() {}

    public RevenueSummaryResponse(BigDecimal totalRevenue, Double percentageChange, String comparisonPeriod, String range) {
        this.totalRevenue = totalRevenue;
        this.percentageChange = percentageChange;
        this.comparisonPeriod = comparisonPeriod;
        this.range = range;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
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
