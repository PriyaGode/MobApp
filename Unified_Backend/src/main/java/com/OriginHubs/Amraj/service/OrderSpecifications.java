package com.OriginHubs.Amraj.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.OriginHubs.Amraj.model.Order;

public class OrderSpecifications {

    public static Specification<Order> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return cb.conjunction();
            // Canonical form: lowercase + hyphen (not underscore) for transit steps, trim spaces
            String normalized = status.trim().toLowerCase().replace('_', '-');
            return cb.equal(root.get("status"), normalized);
        };
    }

    public static Specification<Order> hasHubId(UUID hubId) {
        return (root, query, cb) -> hubId == null ? cb.conjunction() : cb.equal(root.join("hub").get("id"), hubId);
    }

    public static Specification<Order> hasDeliveryPartnerId(Long deliveryPartnerId) {
        return (root, query, cb) -> deliveryPartnerId == null
                ? cb.conjunction()
                : cb.equal(root.join("deliveryPartner").get("id"), deliveryPartnerId);
    }

    public static Specification<Order> hasIssueFlag(Boolean issue) {
        return (root, query, cb) -> issue == null ? cb.conjunction() : cb.equal(root.get("issueFlag"), issue);
    }

    public static Specification<Order> createdAfter(OffsetDateTime from) {
        return (root, query, cb) -> from == null
                ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("createdAt"), from);
    }

    public static Specification<Order> createdBefore(OffsetDateTime to) {
        return (root, query, cb) -> to == null
                ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("createdAt"), to);
    }

    public static Specification<Order> searchOrderIdOrCustomer(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String like = "%" + search.toLowerCase() + "%";
            // try parse as ID
            try {
                return cb.equal(root.get("id"), Long.parseLong(search));
            } catch (NumberFormatException ignored) { }

            return cb.like(cb.lower(root.join("customer").get("fullName")), like);
        };
    }
}
