package com.OriginHubs.Amraj.repository;

import com.OriginHubs.Amraj.model.*;
import com.OriginHubs.Amraj.model.enums.OtpStatus;
import com.OriginHubs.Amraj.model.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserOtpRepository extends JpaRepository<UserOtp, Long> {
    Optional<UserOtp> findByUserAndTypeAndStatus(User user, OtpType type, OtpStatus status);
}
