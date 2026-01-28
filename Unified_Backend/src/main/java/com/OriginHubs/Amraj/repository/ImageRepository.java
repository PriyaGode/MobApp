package com.OriginHubs.Amraj.repository;

import com.OriginHubs.Amraj.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {
    List<Image> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);
}
