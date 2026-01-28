package com.OriginHubs.Amraj.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.OriginHubs.Amraj.config.PaginationProperties;
import com.OriginHubs.Amraj.dto.PagedResponse;
import com.OriginHubs.Amraj.dto.UserCreateRequest;
import com.OriginHubs.Amraj.dto.UserRoleAssignmentRequest;
import com.OriginHubs.Amraj.dto.UserSortField;
import com.OriginHubs.Amraj.dto.UserSummaryResponse;
import com.OriginHubs.Amraj.dto.UserUpdateRequest;
import com.OriginHubs.Amraj.entity.Hub;
import com.OriginHubs.Amraj.entity.UserAccount;
import com.OriginHubs.Amraj.entity.UserActivityLog;
import com.OriginHubs.Amraj.entity.enums.AccessLevel;
import com.OriginHubs.Amraj.entity.enums.ActivityType;
import com.OriginHubs.Amraj.entity.enums.RoleType;
import com.OriginHubs.Amraj.entity.enums.UserStatus;
import com.OriginHubs.Amraj.repository.HubManagementRepository;
import com.OriginHubs.Amraj.repository.UserAccountRepository;
import com.OriginHubs.Amraj.repository.UserActivityLogRepository;
import com.OriginHubs.Amraj.specification.UserAccountSpecification;

@Service
@Transactional(readOnly = true)
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final HubManagementRepository hubRepository;
    private final UserActivityLogRepository activityLogRepository;
    private final PaginationProperties paginationProperties;

    public UserAccountService(UserAccountRepository userAccountRepository, HubManagementRepository hubRepository, 
            UserActivityLogRepository activityLogRepository, PaginationProperties paginationProperties) {
        this.userAccountRepository = userAccountRepository;
        this.hubRepository = hubRepository;
        this.activityLogRepository = activityLogRepository;
        this.paginationProperties = paginationProperties;
    }

    public PagedResponse<UserSummaryResponse> findUsers(
            String search,
            RoleType role,
            UserStatus status,
            AccessLevel accessLevel,
            UUID hubId,
            String hubCode,
            Integer page,
            Integer size,
            String sortBy,
            Sort.Direction direction) {

        int sanitizedPage = page == null || page < 0 ? 0 : page;
        int defaultSize = paginationProperties.getDefaultSize();
        int requestedSize = size == null || size <= 0 ? defaultSize : size;
        int sanitizedSize = Math.min(requestedSize, paginationProperties.getMaxSize());

        UserSortField sortField = UserSortField.fromParam(sortBy);
        Sort sort = Sort.by(direction == null ? Sort.Direction.ASC : direction, sortField.getColumn());

        Pageable pageable = PageRequest.of(sanitizedPage, sanitizedSize, sort);
        Specification<UserAccount> specification = UserAccountSpecification.withFilters(search, role, status, accessLevel, hubId, hubCode);
        Page<UserAccount> result = userAccountRepository.findAll(specification, pageable);

        List<UserSummaryResponse> content = result.getContent().stream()
                .map(this::toSummary)
                .toList();

        return new PagedResponse<>(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.hasNext(),
                result.hasPrevious());
    }

    @Transactional
    public UserSummaryResponse updateUser(UUID userId, UserUpdateRequest request) {
        UserAccount account = findUserOrThrow(userId);
        StringBuilder changes = new StringBuilder();

        if (request.fullName() != null && !request.fullName().equals(account.getFullName())) {
            changes.append("name changed; ");
            account.setFullName(request.fullName());
        }
        if (request.email() != null && !request.email().equals(account.getEmail())) {
            changes.append("email changed; ");
            account.setEmail(request.email());
        }
        if (request.phone() != null && !request.phone().equals(account.getPhone())) {
            changes.append("phone changed; ");
            account.setPhone(request.phone());
        }
        if (request.role() != null && !request.role().equals(account.getRole())) {
            changes.append("role changed to ").append(request.role()).append("; ");
            account.setRole(request.role());
        }
        if (request.status() != null && !request.status().equals(account.getStatus())) {
            changes.append("status changed to ").append(request.status()).append("; ");
            account.setStatus(request.status());
        }
        if (request.accessLevel() != null && !request.accessLevel().equals(account.getAccessLevel())) {
            changes.append("access level changed; ");
            account.setAccessLevel(request.accessLevel());
        }
        if (Boolean.TRUE.equals(request.clearHubAssignment())) {
            changes.append("hub assignment cleared; ");
            account.setAssignedHub(null);
        }
        if (request.hubId() != null) {
            Hub hub = hubRepository.findById(request.hubId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Hub not found"));
            if (account.getAssignedHub() == null || !account.getAssignedHub().getId().equals(hub.getId())) {
                changes.append("hub assigned; ");
                account.setAssignedHub(hub);
            }
        }
        if (request.role() == RoleType.CUSTOMER) {
            account.setAssignedHub(null);
        }

        UserAccount saved = userAccountRepository.save(account);
        
        // Log activity if changes were made
        if (changes.length() > 0) {
            logActivity(saved, ActivityType.DETAILS_UPDATED, changes.toString());
        }
        
        return toSummary(saved);
    }

    @Transactional
    public UserSummaryResponse createUser(UserCreateRequest request) {
        if (request.email() != null && userAccountRepository.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        if (request.phone() != null && !request.phone().isBlank()
                && userAccountRepository.findByPhone(request.phone()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already exists");
        }

        RoleType role = request.role();
        boolean hubRequired = role == RoleType.HUB_ADMIN || role == RoleType.DELIVERY_PARTNER;
        Hub assignedHub = null;
        if (request.hubId() != null) {
            assignedHub = hubRepository.findById(request.hubId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hub not found"));
        } else if (hubRequired) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned hub is required for this role");
        }

        UserAccount account = new UserAccount();
        account.setUserCode(generateUserCode());
        account.setFullName(request.fullName());
        account.setEmail(request.email());
        account.setPhone(request.phone());
        account.setRole(role);
        account.setStatus(UserStatus.ACTIVE);
        account.setAccessLevel(resolveAccessLevel(role));
        account.setAssignedHub(assignedHub);

        UserAccount saved = userAccountRepository.save(account);
        logActivity(saved, ActivityType.USER_CREATED, "New user created with role: " + role);
        return toSummary(saved);
    }

    @Transactional
    public UserSummaryResponse updateStatus(UUID userId, UserStatus status) {
        UserAccount account = findUserOrThrow(userId);
        UserStatus oldStatus = account.getStatus();
        account.setStatus(status);
        UserAccount saved = userAccountRepository.save(account);
        
        ActivityType activityType = status == UserStatus.ACTIVE ? ActivityType.USER_ACTIVATED : ActivityType.USER_DEACTIVATED;
        logActivity(saved, activityType, "Status changed from " + oldStatus + " to " + status);
        return toSummary(saved);
    }

    @Transactional
    public UserSummaryResponse assignRole(UUID userId, UserRoleAssignmentRequest request) {
        UserAccount account = findUserOrThrow(userId);
        
        // Validate user status before applying role changes
        if (account.getStatus() == UserStatus.INACTIVE) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                "Cannot assign role to inactive user. User must be ACTIVE to update role."
            );
        }
        
        RoleType oldRole = account.getRole();
        AccessLevel oldAccessLevel = account.getAccessLevel();
        
        account.setRole(request.role());
        account.setAccessLevel(request.accessLevel());
        
        if (request.hubId() != null) {
            Hub hub = hubRepository.findById(request.hubId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Hub not found"));
            account.setAssignedHub(hub);
        } else {
            account.setAssignedHub(null);
        }
        
        UserAccount saved = userAccountRepository.save(account);
        logActivity(saved, ActivityType.ROLE_ASSIGNED, 
            "Role changed from " + oldRole + " to " + request.role() + 
            "; Access level changed from " + oldAccessLevel + " to " + request.accessLevel());
        return toSummary(saved);
    }

    public PagedResponse<com.OriginHubs.Amraj.dto.LoginHistoryResponse> getLoginHistory(
            UUID userId,
            String userCode,
            Integer page,
            Integer size,
            Sort.Direction direction) {
        
        int sanitizedPage = page == null || page < 0 ? 0 : page;
        int defaultSize = paginationProperties.getDefaultSize();
        int requestedSize = size == null || size <= 0 ? defaultSize : size;
        int sanitizedSize = Math.min(requestedSize, paginationProperties.getMaxSize());

        Sort sort = Sort.by(direction == null ? Sort.Direction.DESC : direction, "createdAt");
        Pageable pageable = PageRequest.of(sanitizedPage, sanitizedSize, sort);

        Page<UserActivityLog> result;
        
        if (userId != null) {
            result = activityLogRepository.findByUser_IdAndActivityType(
                    userId, ActivityType.LOGIN, pageable);
        } else if (userCode != null && !userCode.isBlank()) {
            result = activityLogRepository.findByUser_UserCodeAndActivityType(
                    userCode, ActivityType.LOGIN, pageable);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Either userId or userCode must be provided");
        }

        List<com.OriginHubs.Amraj.dto.LoginHistoryResponse> content = result.getContent().stream()
                .map(this::toLoginHistoryResponse)
                .toList();

        return new PagedResponse<>(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.hasNext(),
                result.hasPrevious());
    }

    private UserAccount findUserOrThrow(UUID userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    private AccessLevel resolveAccessLevel(RoleType role) {
        return switch (role) {
            case SUPER_ADMIN -> AccessLevel.ADMIN;
            case HUB_ADMIN -> AccessLevel.ADMIN;
            case DELIVERY_PARTNER -> AccessLevel.WRITE;
            case CUSTOMER -> AccessLevel.READ;
        };
    }

    private String generateUserCode() {
        String random = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "USR-" + random;
    }

    private com.OriginHubs.Amraj.dto.LoginHistoryResponse toLoginHistoryResponse(UserActivityLog log) {
        UserAccount user = log.getUser();
        return new com.OriginHubs.Amraj.dto.LoginHistoryResponse(
                log.getId(),
                user.getUserCode(),
                user.getFullName(),
                log.getActivityType(),
                log.getDescription(),
                log.getIpAddress(),
                log.getDeviceInfo(),
                log.getCreatedAt()
        );
    }

    private UserSummaryResponse toSummary(UserAccount entity) {
        Hub hub = entity.getAssignedHub();
        
        // Get last login details
        var lastLoginLog = activityLogRepository
                .findTopByUser_UserCodeAndActivityTypeOrderByCreatedAtDesc(
                        entity.getUserCode(), ActivityType.LOGIN);
        
        String lastLoginIp = lastLoginLog.map(UserActivityLog::getIpAddress).orElse(null);
        String lastLoginDevice = lastLoginLog.map(UserActivityLog::getDeviceInfo).orElse(null);
        
        return new UserSummaryResponse(
                entity.getId(),
                entity.getUserCode(),
                entity.getFullName(),
                entity.getRole(),
                entity.getStatus(),
                hub != null ? hub.getName() : null,
                hub != null ? hub.getCode() : null,
                entity.getAccessLevel(),
                entity.getLastLogin(),
                lastLoginIp,
                lastLoginDevice);
    }

    private void logActivity(UserAccount user, ActivityType activityType, String description) {
        UserActivityLog log = new UserActivityLog();
        log.setUser(user);
        log.setActivityType(activityType);
        log.setDescription(description);
        activityLogRepository.save(log);
    }
}
