package com.OriginHubs.Amraj.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.OriginHubs.Amraj.model.ProductHubVisibility;

@Repository
public interface ProductHubVisibilityRepository extends JpaRepository<ProductHubVisibility, Integer> {
    List<ProductHubVisibility> findByProductId(Long productId);
    Optional<ProductHubVisibility> findByProductIdAndHubId(Long productId, UUID hubId);
}
