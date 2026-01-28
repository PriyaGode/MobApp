package com.OriginHubs.Amraj.repository;

import java.util.UUID; // Import UUID

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.OriginHubs.Amraj.entity.Hub;

@Repository
public interface HubRepository extends JpaRepository<Hub, UUID> {
    // The findByName method has been removed as it caused the error.
    // The Hub entity no longer has a "name" property.
}
