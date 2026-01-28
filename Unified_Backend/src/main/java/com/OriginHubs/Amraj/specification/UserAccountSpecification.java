package com.OriginHubs.Amraj.specification;

import java.util.Locale;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.OriginHubs.Amraj.entity.UserAccount;
import com.OriginHubs.Amraj.entity.enums.AccessLevel;
import com.OriginHubs.Amraj.entity.enums.RoleType;
import com.OriginHubs.Amraj.entity.enums.UserStatus;

public final class UserAccountSpecification {

    public static Specification<UserAccount> withFilters(
            String search,
            RoleType role,
            UserStatus status,
            AccessLevel accessLevel,
            UUID hubId,
            String assignedHubCode) {

        Specification<UserAccount> spec = Specification.allOf();

        if (search != null && !search.isBlank()) {
            spec = spec.and(searchTerm(search));
        }
        if (role != null) {
            spec = spec.and(hasRole(role));
        }
        if (status != null) {
            spec = spec.and(hasStatus(status));
        }
        if (accessLevel != null) {
            spec = spec.and(hasAccessLevel(accessLevel));
        }
        if (hubId != null) {
            spec = spec.and(isAssignedToHub(hubId));
        }
        if (assignedHubCode != null && !assignedHubCode.isBlank()) {
            spec = spec.and(isAssignedToHubCode(assignedHubCode));
        }
        return spec;
    }

    private static Specification<UserAccount> searchTerm(String rawSearch) {
        String keyword = "%" + rawSearch.trim().toLowerCase(Locale.ENGLISH) + "%";
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("fullName")), keyword),
                builder.like(builder.lower(root.get("userCode")), keyword),
                builder.like(builder.lower(root.get("email")), keyword),
                builder.like(builder.lower(root.get("role").as(String.class)), keyword)
        );
    }

    private static Specification<UserAccount> hasRole(RoleType role) {
        return (root, query, builder) -> builder.equal(root.get("role"), role);
    }

    private static Specification<UserAccount> hasStatus(UserStatus status) {
        return (root, query, builder) -> builder.equal(root.get("status"), status);
    }

    private static Specification<UserAccount> hasAccessLevel(AccessLevel accessLevel) {
        return (root, query, builder) -> builder.equal(root.get("accessLevel"), accessLevel);
    }

    private static Specification<UserAccount> isAssignedToHub(UUID hubId) {
        return (root, query, builder) -> builder.equal(root.get("assignedHub").get("id"), hubId);
    }

    private static Specification<UserAccount> isAssignedToHubCode(String hubCode) {
        return (root, query, builder) -> builder.equal(builder.lower(root.get("assignedHub").get("code")), hubCode.toLowerCase(Locale.ENGLISH));
    }

    private UserAccountSpecification() {
    }
}
