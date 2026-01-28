package com.OriginHubs.Amraj.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.OriginHubs.Amraj.dto.AuditLogResponse;
import com.OriginHubs.Amraj.entity.AuditLog;
import com.OriginHubs.Amraj.entity.enums.AuditActionType;
import com.OriginHubs.Amraj.repository.AuditLogRepository;
import com.OriginHubs.Amraj.specification.AuditLogSpecification;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AuditLogService {

    private final AuditLogRepository repository;
    private final ObjectMapper objectMapper;

    public AuditLogService(AuditLogRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public AuditLog recordAction(UUID userId,
                                 AuditActionType actionType,
                                 String entityType,
                                 String entityId,
                                 UUID hubId,
                                 String regionSnapshot,
                                 String ipAddress,
                                 String source,
                                 String severity,
                                 String summary) {
        AuditLog log = new AuditLog(userId, actionType, entityType, entityId, hubId, regionSnapshot, ipAddress, source, severity, summary);
        return repository.save(log);
    }

    /**
     * Record action with optional structured old/new/detail payloads and correlation id.
     * Payloads are converted to JSON using the application's ObjectMapper. If conversion fails
     * the raw toString() of the object will be stored as a fallback.
     */
    public AuditLog recordAction(UUID userId,
                                 AuditActionType actionType,
                                 String entityType,
                                 String entityId,
                                 UUID hubId,
                                 String regionSnapshot,
                                 String ipAddress,
                                 String source,
                                 String severity,
                                 String summary,
                                 Object oldData,
                                 Object newData,
                                 Object detail,
                                 UUID correlationId) {
        AuditLog log = new AuditLog(userId, actionType, entityType, entityId, hubId, regionSnapshot, ipAddress, source, severity, summary);
        // convert optional objects to JSON strings
        try {
            if (oldData != null) log.setOldData(objectMapper.writeValueAsString(oldData));
        } catch (JsonProcessingException e) {
            log.setOldData(String.valueOf(oldData));
        }
        try {
            if (newData != null) log.setNewData(objectMapper.writeValueAsString(newData));
        } catch (JsonProcessingException e) {
            log.setNewData(String.valueOf(newData));
        }
        try {
            if (detail != null) log.setDetail(objectMapper.writeValueAsString(detail));
        } catch (JsonProcessingException e) {
            log.setDetail(String.valueOf(detail));
        }
        log.setCorrelationId(correlationId);
        return repository.save(log);
    }

    public Page<AuditLogResponse> fetchAuditLogs(String userId,
                                                 AuditActionType actionType,
                                                 LocalDateTime startDate,
                                                 LocalDateTime endDate,
                                                 String search,
                                                 int page,
                                                 int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return repository.findAll(
                AuditLogSpecification.withFilters(userId, actionType, startDate, endDate, search),
                pageable
        ).map(AuditLogResponse::fromEntity);
    }

    public long countToday() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = start.plusDays(1).minusNanos(1);
        return repository.countByCreatedAtBetween(start, end);
    }
}
