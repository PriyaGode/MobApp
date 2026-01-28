
package com.OriginHubs.Amraj.controller;

import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.dto.PagedResponse;
import com.OriginHubs.Amraj.dto.UserCreateRequest;
import com.OriginHubs.Amraj.dto.UserRoleAssignmentRequest;
import com.OriginHubs.Amraj.dto.UserStatusUpdateRequest;
import com.OriginHubs.Amraj.dto.UserSummaryResponse;
import com.OriginHubs.Amraj.dto.UserUpdateRequest;
import com.OriginHubs.Amraj.entity.enums.AccessLevel;
import com.OriginHubs.Amraj.entity.enums.AuditActionType;
import com.OriginHubs.Amraj.entity.enums.RoleType;
import com.OriginHubs.Amraj.entity.enums.UserStatus;
import com.OriginHubs.Amraj.service.AuditLogService;
import com.OriginHubs.Amraj.service.UserAccountService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/users")
@Validated
public class UserAccountController {

    private final UserAccountService userAccountService;
    private final AuditLogService auditLogService;

    public UserAccountController(UserAccountService userAccountService, AuditLogService auditLogService) {
        this.userAccountService = userAccountService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public PagedResponse<UserSummaryResponse> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, name = "role") String roleParam,
            @RequestParam(required = false, name = "status") String statusParam,
            @RequestParam(required = false, name = "accessLevel") String accessLevelParam,
            @RequestParam(required = false) UUID hubId,
            @RequestParam(required = false) String hubCode,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(name = "sort", required = false) String sortBy,
            @RequestParam(required = false, name = "direction") String directionParam
    ) {
        RoleType role = parseEnum(roleParam, RoleType.class);
        UserStatus status = parseEnum(statusParam, UserStatus.class);
        AccessLevel accessLevel = parseEnum(accessLevelParam, AccessLevel.class);
        Sort.Direction direction = parseSort(directionParam);

        return userAccountService.findUsers(
                search,
                role,
                status,
                accessLevel,
                hubId,
                hubCode,
                page,
                size,
                sortBy,
                direction);
    }

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public UserSummaryResponse createUser(@RequestHeader(value = "X-Actor-Id", required = false) java.util.UUID actorId,
                                          @Valid @RequestBody UserCreateRequest request) {
        UserSummaryResponse created = userAccountService.createUser(request);
        if (actorId != null) {
            auditLogService.recordAction(actorId, AuditActionType.USER_CREATED, "UserAccount", created.id().toString(), null, null, null, "API", "INFO", "Created user " + created.fullName(), null, created, request, null);
        }
        return created;
    }

    @PatchMapping("/{userId}")
    @ResponseStatus(HttpStatus.OK)
    public UserSummaryResponse updateUser(
            @RequestHeader(value = "X-Actor-Id", required = false) java.util.UUID actorId,
            @PathVariable UUID userId,
            @Valid @RequestBody UserUpdateRequest request) {
        UserSummaryResponse before = null; // could fetch before state via a service method returning entity
        UserSummaryResponse updated = userAccountService.updateUser(userId, request);
        if (actorId != null) {
            auditLogService.recordAction(actorId, AuditActionType.ROLE_CHANGED, "UserAccount", updated.id().toString(), null, null, null, "API", "INFO", "Updated user details", before, updated, request, null);
        }
        return updated;
    }

    @PostMapping("/{userId}/status")
    @ResponseStatus(HttpStatus.OK)
    public UserSummaryResponse updateStatus(
            @RequestHeader(value = "X-Actor-Id", required = false) java.util.UUID actorId,
            @PathVariable UUID userId,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        UserSummaryResponse updated = userAccountService.updateStatus(userId, request.status());
        if (actorId != null) {
            AuditActionType type = request.status() == com.OriginHubs.Amraj.entity.enums.UserStatus.ACTIVE ? AuditActionType.USER_ACTIVATED : AuditActionType.USER_DEACTIVATED;
            auditLogService.recordAction(actorId, type, "UserAccount", updated.id().toString(), null, null, null, "API", "INFO", "Changed user status to " + request.status(), null, updated, request, null);
        }
        return updated;
    }

    @PostMapping("/{userId}/role")
    @ResponseStatus(HttpStatus.OK)
    public UserSummaryResponse assignRole(
            @RequestHeader(value = "X-Actor-Id", required = false) java.util.UUID actorId,
            @PathVariable UUID userId,
            @Valid @RequestBody UserRoleAssignmentRequest request) {
        UserSummaryResponse before = null;
        UserSummaryResponse updated = userAccountService.assignRole(userId, request);
        if (actorId != null) {
            auditLogService.recordAction(actorId, AuditActionType.ROLE_CHANGED, "UserAccount", updated.id().toString(), null, null, null, "API", "INFO", "Changed user role to " + request.role(), before, updated, request, null);
        }
        return updated;
    }

    @GetMapping("/login-history")
    public PagedResponse<com.OriginHubs.Amraj.dto.LoginHistoryResponse> getLoginHistory(
            @RequestParam UUID userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, name = "direction") String directionParam
    ) {
        Sort.Direction direction = parseSort(directionParam);
        return userAccountService.getLoginHistory(userId, null, page, size, direction);
    }

    @GetMapping("/audit")
    public PagedResponse<com.OriginHubs.Amraj.dto.LoginHistoryResponse> getAuditTrail(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, name = "direction") String directionParam
    ) {
        Sort.Direction direction = parseSort(directionParam);
        return userAccountService.getLoginHistory(userId, null, page, size, direction);
    }

    private <E extends Enum<E>> E parseEnum(String value, Class<E> enumType) {
        if (value == null || value.isBlank()) {
            return null;
        }
        for (E constant : enumType.getEnumConstants()) {
            if (constant.name().equalsIgnoreCase(value)) {
                return constant;
            }
        }
        return null;
    }

    private Sort.Direction parseSort(String direction) {
        if (direction == null || direction.isBlank()) {
            return Sort.Direction.ASC;
        }
        try {
            return Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException ignored) {
            return Sort.Direction.ASC;
        }
    }
}
