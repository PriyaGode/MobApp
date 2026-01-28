package com.OriginHubs.Amraj.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.dto.PagedResponse;
import com.OriginHubs.Amraj.dto.UserActivityResponse;
import com.OriginHubs.Amraj.entity.enums.ActivityType;
import com.OriginHubs.Amraj.service.UserActivityService;

@RestController
@RequestMapping("/api/users/activity")
public class UserActivityController {

    private final UserActivityService userActivityService;

    public UserActivityController(UserActivityService userActivityService) {
        this.userActivityService = userActivityService;
    }

    @GetMapping
    public PagedResponse<UserActivityResponse> getActivity(
            @RequestParam(required = false) String userCode,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false, name = "activityType") String activityTypeParam,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        ActivityType activityType = parseEnum(activityTypeParam, ActivityType.class);
        return userActivityService.findActivity(userCode, userId, activityType, page, size);
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
}
