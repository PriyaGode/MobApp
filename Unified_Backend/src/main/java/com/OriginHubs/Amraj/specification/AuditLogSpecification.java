package com.OriginHubs.Amraj.specification;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import com.OriginHubs.Amraj.entity.AuditLog;
import com.OriginHubs.Amraj.entity.enums.AuditActionType;

public final class AuditLogSpecification {

    public static Specification<AuditLog> withFilters(String userId,
                                                      AuditActionType actionType,
                                                      LocalDateTime startDate,
                                                      LocalDateTime endDate,
                                                      String search) {
        Specification<AuditLog> spec = Specification.allOf();
        if (userId != null && !userId.isBlank()) {
            spec = spec.and((root, q, b) -> b.equal(root.get("userId").as(String.class), userId));
        }
        if (actionType != null) {
            spec = spec.and((root, q, b) -> b.equal(root.get("actionType"), actionType));
        }
        if (startDate != null) {
            spec = spec.and((root, q, b) -> b.greaterThanOrEqualTo(root.get("createdAt"), startDate));
        }
        if (endDate != null) {
            spec = spec.and((root, q, b) -> b.lessThanOrEqualTo(root.get("createdAt"), endDate));
        }
        if (search != null && !search.isBlank()) {
            String like = "%" + search.trim().toLowerCase(Locale.ENGLISH) + "%";
            spec = spec.and((root, q, b) -> b.or(
                    b.like(b.lower(root.get("summary")), like),
                    b.like(b.lower(root.get("regionSnapshot")), like),
                    b.like(b.lower(root.get("ipAddress")), like)
            ));
        }
        return spec;
    }

    private AuditLogSpecification() {}
}
