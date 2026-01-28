package com.OriginHubs.Amraj.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.entity.enums.AuditActionType;
import com.OriginHubs.Amraj.model.SystemAlert;
import com.OriginHubs.Amraj.service.AlertService;
import com.OriginHubs.Amraj.service.AuditLogService;

@RestController
@RequestMapping("/api/admin/alerts")
public class AlertController {
    
    private final AlertService alertService;
    private final AuditLogService auditLogService;
    
    public AlertController(AlertService alertService, AuditLogService auditLogService) {
        this.alertService = alertService;
        this.auditLogService = auditLogService;
    }
    
    @GetMapping
    public ResponseEntity<List<SystemAlert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }
    
    @GetMapping("/unacknowledged")
    public ResponseEntity<List<SystemAlert>> getUnacknowledgedAlerts() {
        return ResponseEntity.ok(alertService.getUnacknowledgedAlerts());
    }
    
    @GetMapping("/count")
    public ResponseEntity<Long> getUnacknowledgedCount() {
        return ResponseEntity.ok(alertService.getUnacknowledgedCount());
    }
    
    @PostMapping
    public ResponseEntity<SystemAlert> createAlert(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
                                                   @RequestBody SystemAlert alert) {
        SystemAlert createdAlert = alertService.createAlert(alert);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.SYSTEM_ALERT_CREATED, "SystemAlert", String.valueOf(createdAlert.getId()), null, null, null, "API", "INFO", "Created system alert: " + createdAlert.getTitle(), null, createdAlert, null, null);
        }
        return ResponseEntity.ok(createdAlert);
    }
    
    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<SystemAlert> acknowledgeAlert(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID actorId,
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        SystemAlert alert = alertService.acknowledgeAlert(id, userId);
        if (actorId != null) {
            auditLogService.recordAction(actorId, AuditActionType.SYSTEM_ALERT_ACKNOWLEDGED, "SystemAlert", String.valueOf(id), null, null, null, "API", "INFO", "Acknowledged system alert id=" + id, null, alert, Map.of("ackUserId", userId), null);
        }
        return ResponseEntity.ok(alert);
    }
}
