package com.OriginHubs.Amraj.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.OriginHubs.Amraj.entity.Hub;
import com.OriginHubs.Amraj.entity.enums.HubStatus;

public interface HubManagementRepository extends JpaRepository<Hub, UUID>, JpaSpecificationExecutor<Hub> {

    Optional<Hub> findByCode(String code);

    Optional<Hub> findByName(String name);

    List<Hub> findByStatus(HubStatus status);

    @Query("SELECT h FROM com.OriginHubs.Amraj.entity.Hub h WHERE " +
           "(:status IS NULL OR h.status = :status) AND " +
           "(:search IS NULL OR " +
           "h.name LIKE %:search% OR " +
           "h.code LIKE %:search% OR " +
           "h.location LIKE %:search% OR " +
           "h.city LIKE %:search%) " +
           "ORDER BY h.city, h.name")
    List<Hub> findByStatusAndSearch(@Param("status") HubStatus status, @Param("search") String search);

    @Query("SELECT DISTINCT h.city FROM com.OriginHubs.Amraj.entity.Hub h WHERE h.city IS NOT NULL ORDER BY h.city")
    List<String> findAllCities();

    @Query("SELECT DISTINCT h.region FROM com.OriginHubs.Amraj.entity.Hub h WHERE h.region IS NOT NULL ORDER BY h.region")
    List<String> findAllRegions();
}
