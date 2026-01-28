package com.OriginHubs.Amraj.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.OriginHubs.Amraj.entity.InventoryItem;
import com.OriginHubs.Amraj.entity.enums.InventoryStatus;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {

    List<InventoryItem> findByHubId(UUID hubId);

    @Query("SELECT i FROM InventoryItem i WHERE i.hub.id = :hubId AND i.status = :status")
    List<InventoryItem> findByHubIdAndStatus(@Param("hubId") UUID hubId, @Param("status") InventoryStatus status);

    @Query("SELECT i FROM InventoryItem i WHERE i.hub.id = :hubId AND " +
           "(i.sku LIKE %:search% OR i.productName LIKE %:search%)")
    List<InventoryItem> findByHubIdAndSearch(@Param("hubId") UUID hubId, @Param("search") String search);

    @Query("SELECT i FROM InventoryItem i WHERE i.hub.id = :hubId AND i.status = :status AND " +
           "(i.sku LIKE %:search% OR i.productName LIKE %:search%)")
    List<InventoryItem> findByHubIdAndStatusAndSearch(@Param("hubId") UUID hubId, 
                                                        @Param("status") InventoryStatus status,
                                                        @Param("search") String search);

    Optional<InventoryItem> findByHubIdAndSku(UUID hubId, String sku);

    @Query("SELECT i FROM InventoryItem i WHERE i.status IN (:statuses)")
    List<InventoryItem> findByStatusIn(@Param("statuses") List<InventoryStatus> statuses);

    @Query("SELECT i FROM InventoryItem i WHERE i.hub.id = :hubId AND i.quantity < i.reorderLevel")
    List<InventoryItem> findLowStockByHubId(@Param("hubId") UUID hubId);
}
