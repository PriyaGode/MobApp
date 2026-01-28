package com.OriginHubs.Amraj.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.model.SystemAlert;
import com.OriginHubs.Amraj.repository.SystemAlertRepository;
import com.OriginHubs.Amraj.websocket.AlertWebSocketHandler;

@Service
public class AlertService {
    
    private final SystemAlertRepository alertRepository;
    private final AlertWebSocketHandler alertWebSocketHandler;
    
    public AlertService(SystemAlertRepository alertRepository, AlertWebSocketHandler alertWebSocketHandler) {
        this.alertRepository = alertRepository;
        this.alertWebSocketHandler = alertWebSocketHandler;
    }
    
    public List<SystemAlert> getActiveAlerts() {
        return alertRepository.findAllActiveAlerts(OffsetDateTime.now(ZoneOffset.UTC));
    }
    
    public List<SystemAlert> getUnacknowledgedAlerts() {
        return alertRepository.findActiveAlerts(OffsetDateTime.now(ZoneOffset.UTC));
    }
    
    public Long getUnacknowledgedCount() {
        return alertRepository.countByAcknowledgedFalse();
    }
    
    @Transactional
    public SystemAlert acknowledgeAlert(Long alertId, Long userId) {
        SystemAlert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        alert.setAcknowledged(true);
        alert.setAcknowledgedBy(userId);
        alert.setAcknowledgedAt(OffsetDateTime.now(ZoneOffset.UTC));
        
        SystemAlert savedAlert = alertRepository.save(alert);
        
        // Broadcast acknowledgment to all connected clients
        alertWebSocketHandler.broadcastAlertAcknowledged(alertId);
        
        return savedAlert;
    }
    
    @Transactional
    public SystemAlert createAlert(SystemAlert alert) {
        alert.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        SystemAlert savedAlert = alertRepository.save(alert);
        
        // Broadcast new alert to all connected clients
        alertWebSocketHandler.broadcastNewAlert(savedAlert);
        
        return savedAlert;
    }
}
