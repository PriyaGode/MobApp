package com.OriginHubs.Amraj.dto;

import com.OriginHubs.Amraj.entity.enums.RoleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record UserCreateRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100)
        String fullName,
        @Email(message = "Invalid email")
        String email,
        @Pattern(regexp = "^$|^\\+?[0-9]{7,15}$", message = "Phone must be digits with optional +")
        String phone,
        @NotNull(message = "Role is required")
        RoleType role,
        UUID hubId
) {
}
