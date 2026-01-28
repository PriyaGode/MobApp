package com.OriginHubs.Amraj.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.OriginHubs.Amraj.model.Order;
import com.OriginHubs.Amraj.model.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findTopByOrder_IdOrderByCreatedAtDesc(Long orderId);
    Optional<Payment> findTopByOrder_IdOrderByIdDesc(Long orderId);
    Optional<Payment> findByOrder(Order order);

    @org.springframework.data.jpa.repository.Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.createdAt BETWEEN :start AND :end
        AND LOWER(p.status) = LOWER(:status)
    """)
    java.math.BigDecimal sumAmountByCreatedAtBetweenAndStatus(
        @org.springframework.data.repository.query.Param("start") java.time.OffsetDateTime start,
        @org.springframework.data.repository.query.Param("end") java.time.OffsetDateTime end,
        @org.springframework.data.repository.query.Param("status") String status
    );
}
