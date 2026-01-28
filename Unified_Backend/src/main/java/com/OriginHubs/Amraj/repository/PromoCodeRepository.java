package com.OriginHubs.Amraj.repository;

import com.OriginHubs.Amraj.model.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {
    
    @Query("SELECT p FROM PromoCode p WHERE p.code = :code AND p.isActive = true")
    Optional<PromoCode> findByCodeAndIsActiveTrue(@Param("code") String code);
    
    @Query("SELECT p FROM PromoCode p WHERE p.code = :code AND p.isActive = true " +
           "AND p.validFrom <= :now AND p.validUntil >= :now")
    Optional<PromoCode> findValidPromoCode(@Param("code") String code, @Param("now") LocalDateTime now);
}