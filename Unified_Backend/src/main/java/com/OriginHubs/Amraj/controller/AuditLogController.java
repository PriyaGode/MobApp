package com.OriginHubs.Amraj.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.dto.AuditLogResponse;
import com.OriginHubs.Amraj.entity.enums.AuditActionType;
import com.OriginHubs.Amraj.service.AuditLogService;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;
    private final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_DATE;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) AuditActionType actionType,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        LocalDateTime start = null;
        LocalDateTime end = null;
        if (dateRange != null && !dateRange.isBlank()) {
            String[] parts = dateRange.split(",");
            if (parts.length == 2) {
                start = LocalDate.parse(parts[0].trim(), DATE_FMT).atStartOfDay();
                end = LocalDate.parse(parts[1].trim(), DATE_FMT).atTime(23, 59, 59);
            }
        } else {
            if (startDate != null && !startDate.isBlank()) {
                start = LocalDate.parse(startDate.trim(), DATE_FMT).atStartOfDay();
            }
            if (endDate != null && !endDate.isBlank()) {
                end = LocalDate.parse(endDate.trim(), DATE_FMT).atTime(23, 59, 59);
            }
        }

        Page<AuditLogResponse> result = auditLogService.fetchAuditLogs(userId, actionType, start, end, search, page, size);
        long todayCount = auditLogService.countToday();

        Map<String, Object> body = new HashMap<>();
        body.put("content", result.getContent());
        body.put("page", result.getNumber());
        body.put("size", result.getSize());
        body.put("totalElements", result.getTotalElements());
        body.put("totalPages", result.getTotalPages());
        body.put("hasNext", result.hasNext());
        body.put("hasPrevious", result.hasPrevious());
        body.put("todayCount", todayCount);
        return ResponseEntity.ok(body);
    }
}
