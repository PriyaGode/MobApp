package com.OriginHubs.Amraj.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.OriginHubs.Amraj.model.OrderDeliveryStep;

public interface OrderDeliveryStepRepository extends JpaRepository<OrderDeliveryStep, Long> {
    List<OrderDeliveryStep> findByOrder_IdOrderByTimestampAsc(Long orderId);
    Optional<OrderDeliveryStep> findTopByOrder_IdOrderByTimestampDesc(Long orderId);
}
