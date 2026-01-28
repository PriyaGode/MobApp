package com.OriginHubs.Amraj.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.dto.ActiveUsersResponse;
import com.OriginHubs.Amraj.dto.HubPerformanceResponse;
import com.OriginHubs.Amraj.dto.OrdersGraphResponse;
import com.OriginHubs.Amraj.dto.OrdersSummaryResponse;
import com.OriginHubs.Amraj.dto.RevenueGraphResponse;
import com.OriginHubs.Amraj.dto.RevenueSummaryResponse;
import com.OriginHubs.Amraj.service.DashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/orders/summary")
    public ResponseEntity<OrdersSummaryResponse> getOrdersSummary(
            @RequestParam(defaultValue = "daily") String range) {
        OrdersSummaryResponse response = dashboardService.getOrdersSummary(range);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/revenue/summary")
    public ResponseEntity<RevenueSummaryResponse> getRevenueSummary(
            @RequestParam(defaultValue = "daily") String range) {
        RevenueSummaryResponse response = dashboardService.getRevenueSummary(range);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/hubs/performance")
    public ResponseEntity<HubPerformanceResponse> getTopHubsPerformance(
            @RequestParam(defaultValue = "5") int limit) {
        HubPerformanceResponse response = dashboardService.getTopHubsPerformance(limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/active")
    public ResponseEntity<ActiveUsersResponse> getActiveUsers(
            @RequestParam(defaultValue = "24h") String range) {
        ActiveUsersResponse response = dashboardService.getActiveUsers(range);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/graph")
    public ResponseEntity<OrdersGraphResponse> getOrdersGraph(
            @RequestParam(defaultValue = "weekly") String range) {
        OrdersGraphResponse response = dashboardService.getOrdersGraph(range);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/revenue/graph")
    public ResponseEntity<RevenueGraphResponse> getRevenueGraph(
            @RequestParam(defaultValue = "weekly") String range) {
        RevenueGraphResponse response = dashboardService.getRevenueGraph(range);
        return ResponseEntity.ok(response);
    }
}
