package com.OriginHubs.Amraj.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.OriginHubs.Amraj.model.DeliveryPartner;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    
    @Query(value = """
        SELECT COUNT(DISTINCT dp.id)
        FROM delivery_partners dp
        INNER JOIN orders o ON o.delivery_partner_id = dp.id
        WHERE o.created_at >= :since
    """, nativeQuery = true)
    Long countActiveDeliveryPartnersSince(@Param("since") java.time.OffsetDateTime since);
}
