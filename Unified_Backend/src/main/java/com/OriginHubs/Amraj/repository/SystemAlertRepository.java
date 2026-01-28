package com.OriginHubs.Amraj.repository;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.OriginHubs.Amraj.model.SystemAlert;

@Repository
public interface SystemAlertRepository extends JpaRepository<SystemAlert, Long> {
    
    @Query("SELECT a FROM SystemAlert a WHERE a.acknowledged = false AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.createdAt DESC")
    List<SystemAlert> findActiveAlerts(OffsetDateTime now);
    
    @Query("SELECT a FROM SystemAlert a WHERE (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.createdAt DESC")
    List<SystemAlert> findAllActiveAlerts(OffsetDateTime now);
    
    Long countByAcknowledgedFalse();
}
