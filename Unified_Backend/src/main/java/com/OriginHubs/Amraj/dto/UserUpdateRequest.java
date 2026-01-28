package com.OriginHubs.Amraj.dto;

import com.OriginHubs.Amraj.entity.enums.AccessLevel;
import com.OriginHubs.Amraj.entity.enums.RoleType;
import com.OriginHubs.Amraj.entity.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record UserUpdateRequest(
        @Size(min = 2, max = 80)
        String fullName,
        @Email
        String email,
        @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Phone must be digits with optional + prefix")
        String phone,
        RoleType role,
        UserStatus status,
        AccessLevel accessLevel,
        UUID hubId,
        Boolean clearHubAssignment
) {
}
