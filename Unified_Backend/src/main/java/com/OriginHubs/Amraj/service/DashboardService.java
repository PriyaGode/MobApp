package com.OriginHubs.Amraj.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.OriginHubs.Amraj.dto.ActiveUsersResponse;
import com.OriginHubs.Amraj.dto.HubPerformanceResponse;
import com.OriginHubs.Amraj.dto.OrdersGraphResponse;
import com.OriginHubs.Amraj.dto.OrdersSummaryResponse;
import com.OriginHubs.Amraj.dto.RevenueGraphResponse;
import com.OriginHubs.Amraj.dto.RevenueSummaryResponse;
import com.OriginHubs.Amraj.repository.DeliveryPartnerRepository;
import com.OriginHubs.Amraj.repository.OrderRepository;
import com.OriginHubs.Amraj.repository.PaymentRepository;
import com.OriginHubs.Amraj.repository.UserRepository;

@Service
public class DashboardService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;

    public DashboardService(OrderRepository orderRepository, PaymentRepository paymentRepository,
                           UserRepository userRepository, DeliveryPartnerRepository deliveryPartnerRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
    }

    public OrdersSummaryResponse getOrdersSummary(String range) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime currentPeriodStart;
        OffsetDateTime previousPeriodStart;
        OffsetDateTime previousPeriodEnd;
        String comparisonPeriod;

        switch (range.toLowerCase()) {
            case "daily":
                currentPeriodStart = now.toLocalDate().atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
                previousPeriodStart = currentPeriodStart.minusDays(1);
                previousPeriodEnd = currentPeriodStart;
                comparisonPeriod = "Yesterday";
                break;
            case "weekly":
                currentPeriodStart = now.minusDays(7);
                previousPeriodStart = now.minusDays(14);
                previousPeriodEnd = currentPeriodStart;
                comparisonPeriod = "Previous Week";
                break;
            case "monthly":
                currentPeriodStart = now.minusDays(30);
                previousPeriodStart = now.minusDays(60);
                previousPeriodEnd = currentPeriodStart;
                comparisonPeriod = "Previous Month";
                break;
            default:
                currentPeriodStart = now.toLocalDate().atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
                previousPeriodStart = currentPeriodStart.minusDays(1);
                previousPeriodEnd = currentPeriodStart;
                comparisonPeriod = "Yesterday";
                range = "daily";
        }

        Long currentCount = orderRepository.countByCreatedAtBetween(currentPeriodStart, now);
        Long previousCount = orderRepository.countByCreatedAtBetween(previousPeriodStart, previousPeriodEnd);

        Double percentageChange = 0.0;
        if (previousCount > 0) {
            percentageChange = ((currentCount - previousCount) * 100.0) / previousCount;
            percentageChange = Math.round(percentageChange * 10.0) / 10.0;
        }

        return new OrdersSummaryResponse(currentCount, percentageChange, comparisonPeriod, range);
    }

    public RevenueSummaryResponse getRevenueSummary(String range) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime currentPeriodStart;
        OffsetDateTime previousPeriodStart;
        OffsetDateTime previousPeriodEnd;
        String comparisonPeriod;

        switch (range.toLowerCase()) {
            case "daily":
                currentPeriodStart = now.toLocalDate().atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
                previousPeriodStart = currentPeriodStart.minusDays(1);
                previousPeriodEnd = currentPeriodStart;
                comparisonPeriod = "Yesterday";
                break;
            case "weekly":
                currentPeriodStart = now.minusDays(7);
                previousPeriodStart = now.minusDays(14);
                previousPeriodEnd = currentPeriodStart;
                comparisonPeriod = "Previous Week";
                break;
            case "monthly":
                currentPeriodStart = now.minusDays(30);
                previousPeriodStart = now.minusDays(60);
                previousPeriodEnd = currentPeriodStart;
                comparisonPeriod = "Previous Month";
                break;
            default:
                currentPeriodStart = now.toLocalDate().atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
                previousPeriodStart = currentPeriodStart.minusDays(1);
                previousPeriodEnd = currentPeriodStart;
                comparisonPeriod = "Yesterday";
                range = "daily";
        }

        BigDecimal currentRevenue = paymentRepository.sumAmountByCreatedAtBetweenAndStatus(
            currentPeriodStart, now, "SUCCESS");
        BigDecimal previousRevenue = paymentRepository.sumAmountByCreatedAtBetweenAndStatus(
            previousPeriodStart, previousPeriodEnd, "SUCCESS");

        if (currentRevenue == null) currentRevenue = BigDecimal.ZERO;
        if (previousRevenue == null) previousRevenue = BigDecimal.ZERO;

        Double percentageChange = 0.0;
        if (previousRevenue.compareTo(BigDecimal.ZERO) > 0) {
            percentageChange = currentRevenue.subtract(previousRevenue)
                .multiply(BigDecimal.valueOf(100))
                .divide(previousRevenue, 2, java.math.RoundingMode.HALF_UP)
                .doubleValue();
        }

        return new RevenueSummaryResponse(currentRevenue, percentageChange, comparisonPeriod, range);
    }

    public HubPerformanceResponse getTopHubsPerformance(int limit) {
        OffsetDateTime startOfToday = OffsetDateTime.now(ZoneOffset.UTC)
            .toLocalDate().atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
        
        List<Object[]> hubStats = orderRepository.findTopHubsByOrderCount(startOfToday, PageRequest.of(0, limit));
        
        List<HubPerformanceResponse.HubStats> topHubs = hubStats.stream()
            .map(row -> new HubPerformanceResponse.HubStats(
                row[0] != null ? row[0].toString() : "",
                row[1] != null ? row[1].toString() : "Unknown Hub",
                row[2] != null ? row[2].toString() : "",
                row[3] != null ? ((Number) row[3]).longValue() : 0L,
                row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO,
                row[5] != null ? (BigDecimal) row[5] : BigDecimal.ZERO
            ))
            .collect(Collectors.toList());

        return new HubPerformanceResponse(topHubs);
    }

    public ActiveUsersResponse getActiveUsers(String range) {
        OffsetDateTime startTime;
        String timeRange;

        switch (range.toLowerCase()) {
            case "24h":
                startTime = OffsetDateTime.now(ZoneOffset.UTC).minusHours(24);
                timeRange = "Last 24 hours";
                break;
            case "7d":
                startTime = OffsetDateTime.now(ZoneOffset.UTC).minusDays(7);
                timeRange = "Last 7 days";
                break;
            case "30d":
                startTime = OffsetDateTime.now(ZoneOffset.UTC).minusDays(30);
                timeRange = "Last 30 days";
                break;
            default:
                startTime = OffsetDateTime.now(ZoneOffset.UTC).minusHours(24);
                timeRange = "Last 24 hours";
        }

        Long activeCustomers = userRepository.countActiveCustomersSince(startTime);
        Long activeDeliveryPartners = deliveryPartnerRepository.countActiveDeliveryPartnersSince(startTime);
        Long totalActive = activeCustomers + activeDeliveryPartners;

        return new ActiveUsersResponse(totalActive, activeCustomers, activeDeliveryPartners, timeRange);
    }

    public OrdersGraphResponse getOrdersGraph(String range) {
        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        if ("weekly".equalsIgnoreCase(range)) {
            for (int i = 6; i >= 0; i--) {
                OffsetDateTime dayStart = now.minusDays(i).toLocalDate().atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
                OffsetDateTime dayEnd = dayStart.plusDays(1);
                Long count = orderRepository.countByCreatedAtBetween(dayStart, dayEnd);
                labels.add(dayStart.getDayOfWeek().toString().substring(0, 3));
                data.add(count);
            }
        } else {
            for (int i = 6; i >= 0; i--) {
                OffsetDateTime dayStart = now.minusDays(i).toLocalDate().atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
                OffsetDateTime dayEnd = dayStart.plusDays(1);
                Long count = orderRepository.countByCreatedAtBetween(dayStart, dayEnd);
                labels.add(String.valueOf(dayStart.getDayOfMonth()));
                data.add(count);
            }
        }

        return new OrdersGraphResponse(labels, data);
    }

    public RevenueGraphResponse getRevenueGraph(String range) {
        List<String> labels = new ArrayList<>();
        List<BigDecimal> data = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        BigDecimal cumulative = BigDecimal.ZERO;

        for (int i = 6; i >= 0; i--) {
            OffsetDateTime dayStart = now.minusDays(i).toLocalDate().atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
            OffsetDateTime dayEnd = dayStart.plusDays(1);
            BigDecimal dayRevenue = paymentRepository.sumAmountByCreatedAtBetweenAndStatus(dayStart, dayEnd, "SUCCESS");
            if (dayRevenue == null) dayRevenue = BigDecimal.ZERO;
            
            cumulative = cumulative.add(dayRevenue);
            labels.add(dayStart.getDayOfWeek().toString().substring(0, 3));
            data.add(dayRevenue);
        }

        BigDecimal average = data.isEmpty() ? BigDecimal.ZERO : 
            cumulative.divide(BigDecimal.valueOf(data.size()), 2, java.math.RoundingMode.HALF_UP);

        return new RevenueGraphResponse(labels, data, average, cumulative);
    }
}
