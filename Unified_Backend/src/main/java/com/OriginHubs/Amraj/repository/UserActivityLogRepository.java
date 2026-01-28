
package com.OriginHubs.Amraj.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.OriginHubs.Amraj.entity.UserActivityLog;
import com.OriginHubs.Amraj.entity.enums.ActivityType;

public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, UUID> {

    Page<UserActivityLog> findByUser_UserCode(String userCode, Pageable pageable);

    Page<UserActivityLog> findByUser_Id(UUID userId, Pageable pageable);

    Page<UserActivityLog> findByUser_UserCodeAndActivityType(String userCode, ActivityType activityType, Pageable pageable);

    Page<UserActivityLog> findByUser_IdAndActivityType(UUID userId, ActivityType activityType, Pageable pageable);

    Optional<UserActivityLog> findTopByUser_UserCodeAndActivityTypeOrderByCreatedAtDesc(String userCode, ActivityType activityType);
}
