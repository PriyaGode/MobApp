package com.OriginHubs.Amraj.dto;

import java.math.BigDecimal;
import java.util.List;

public class RevenueGraphResponse {
    private List<String> labels;
    private List<BigDecimal> data;
    private BigDecimal averageRevenue;
    private BigDecimal cumulativeRevenue;

    public RevenueGraphResponse() {}

    public RevenueGraphResponse(List<String> labels, List<BigDecimal> data, BigDecimal averageRevenue, BigDecimal cumulativeRevenue) {
        this.labels = labels;
        this.data = data;
        this.averageRevenue = averageRevenue;
        this.cumulativeRevenue = cumulativeRevenue;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public List<BigDecimal> getData() {
        return data;
    }

    public void setData(List<BigDecimal> data) {
        this.data = data;
    }

    public BigDecimal getAverageRevenue() {
        return averageRevenue;
    }

    public void setAverageRevenue(BigDecimal averageRevenue) {
        this.averageRevenue = averageRevenue;
    }

    public BigDecimal getCumulativeRevenue() {
        return cumulativeRevenue;
    }

    public void setCumulativeRevenue(BigDecimal cumulativeRevenue) {
        this.cumulativeRevenue = cumulativeRevenue;
    }
}
