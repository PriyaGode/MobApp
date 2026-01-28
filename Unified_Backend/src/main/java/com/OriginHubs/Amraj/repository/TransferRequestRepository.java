package com.OriginHubs.Amraj.repository;

import com.OriginHubs.Amraj.entity.TransferRequest;
import com.OriginHubs.Amraj.entity.enums.TransferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TransferRequestRepository extends JpaRepository<TransferRequest, UUID> {
    
    Page<TransferRequest> findByStatus(TransferStatus status, Pageable pageable);
    
    @Query("SELECT COUNT(tr) FROM TransferRequest tr WHERE tr.status = :status")
    long countByStatus(@Param("status") TransferStatus status);
    
    @Query("SELECT tr FROM TransferRequest tr " +
           "WHERE (:status IS NULL OR tr.status = :status) " +
           "ORDER BY tr.createdAt DESC")
    Page<TransferRequest> findAllWithOptionalStatus(@Param("status") TransferStatus status, Pageable pageable);
}