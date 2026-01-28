package com.OriginHubs.Amraj.service;

import com.OriginHubs.Amraj.config.PaginationProperties;
import com.OriginHubs.Amraj.dto.PagedResponse;
import com.OriginHubs.Amraj.dto.UserActivityResponse;
import com.OriginHubs.Amraj.entity.UserActivityLog;
import com.OriginHubs.Amraj.entity.enums.ActivityType;
import com.OriginHubs.Amraj.repository.UserActivityLogRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@Transactional(readOnly = true)
public class UserActivityService {

    private final UserActivityLogRepository activityLogRepository;
    private final PaginationProperties paginationProperties;

    public UserActivityService(UserActivityLogRepository activityLogRepository, PaginationProperties paginationProperties) {
        this.activityLogRepository = activityLogRepository;
        this.paginationProperties = paginationProperties;
    }

    public PagedResponse<UserActivityResponse> findActivity(
            String userCode,
            UUID userId,
            ActivityType activityType,
            Integer page,
            Integer size) {

        if ((userCode == null || userCode.isBlank()) && userId == null) {
            throw new ResponseStatusException(BAD_REQUEST, "userCode or userId must be provided");
        }

        int sanitizedPage = page == null || page < 0 ? 0 : page;
        int defaultSize = paginationProperties.getDefaultSize();
        int requestedSize = size == null || size <= 0 ? defaultSize : size;
        int sanitizedSize = Math.min(requestedSize, paginationProperties.getMaxSize());

        Pageable pageable = PageRequest.of(sanitizedPage, sanitizedSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserActivityLog> logs;

        if (userCode != null && !userCode.isBlank()) {
            logs = activityType == null
                    ? activityLogRepository.findByUser_UserCode(userCode, pageable)
                    : activityLogRepository.findByUser_UserCodeAndActivityType(userCode, activityType, pageable);
        } else {
            logs = activityType == null
                    ? activityLogRepository.findByUser_Id(userId, pageable)
                    : activityLogRepository.findByUser_IdAndActivityType(userId, activityType, pageable);
        }

        List<UserActivityResponse> content = logs.getContent().stream()
                .map(entry -> new UserActivityResponse(
                        entry.getId(),
                        entry.getUser().getUserCode(),
                        entry.getActivityType(),
                        entry.getDescription(),
                        entry.getCreatedAt()
                ))
                .toList();

        return new PagedResponse<>(
                content,
                logs.getNumber(),
                logs.getSize(),
                logs.getTotalElements(),
                logs.getTotalPages(),
                logs.hasNext(),
                logs.hasPrevious());
    }
}
