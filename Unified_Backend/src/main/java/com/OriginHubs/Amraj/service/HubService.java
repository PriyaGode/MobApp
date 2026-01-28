package com.OriginHubs.Amraj.service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.dto.HubCreateRequest;
import com.OriginHubs.Amraj.dto.HubDetailResponse;
import com.OriginHubs.Amraj.dto.HubSummaryResponse;
import com.OriginHubs.Amraj.dto.HubUpdateRequest;
import com.OriginHubs.Amraj.entity.Hub;
import com.OriginHubs.Amraj.entity.enums.HubStatus;
import com.OriginHubs.Amraj.repository.HubManagementRepository;

@Service
@Transactional
public class HubService {

    private final HubManagementRepository hubRepository;

    public HubService(HubManagementRepository hubRepository) {
        this.hubRepository = hubRepository;
    }

    /**
     * Get all hubs with optional filtering by status and search term
     */
    @Transactional(readOnly = true)
    public List<HubSummaryResponse> getAllHubs(HubStatus status, String search) {
        List<Hub> hubs = hubRepository.findByStatusAndSearch(status, search);
        return hubs.stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    /**
     * Get hubs grouped by city/region
     */
    @Transactional(readOnly = true)
    public Map<String, List<HubSummaryResponse>> getHubsGroupedByCity(HubStatus status, String search) {
        List<Hub> hubs = hubRepository.findByStatusAndSearch(status, search);
        return hubs.stream()
                .collect(Collectors.groupingBy(
                        hub -> hub.getCity() != null ? hub.getCity() : "Unknown",
                        Collectors.mapping(this::toSummaryResponse, Collectors.toList())
                ));
    }

    /**
     * Get hub by ID
     */
    @Transactional(readOnly = true)
    public HubDetailResponse getHubById(UUID id) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hub not found with ID: " + id));
        return toDetailResponse(hub);
    }

    /**
     * Get hub by code
     */
    @Transactional(readOnly = true)
    public HubDetailResponse getHubByCode(String code) {
        Hub hub = hubRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Hub not found with code: " + code));
        return toDetailResponse(hub);
    }

    /**
     * Create a new hub
     */
    public HubDetailResponse createHub(HubCreateRequest request) {
        // Check if hub code already exists
        if (hubRepository.findByCode(request.code()).isPresent()) {
            throw new IllegalArgumentException("Hub with code '" + request.code() + "' already exists");
        }

        // Check if hub name already exists
        if (hubRepository.findByName(request.name()).isPresent()) {
            throw new IllegalArgumentException("Hub with name '" + request.name() + "' already exists");
        }

        Hub hub = new Hub();
        hub.setCode(request.code());
        hub.setName(request.name());
        hub.setLocation(request.location());
        hub.setContactName(request.contactName());
        hub.setContactPhone(request.contactPhone());
        hub.setContactEmail(request.contactEmail());
        hub.setCity(request.city());
        hub.setRegion(request.region());
        hub.setAddress(request.address());
        hub.setLatitude(request.latitude());
        hub.setLongitude(request.longitude());
        hub.setStatus(request.status() != null ? request.status() : HubStatus.ACTIVE);
        hub.setCreatedAt(ZonedDateTime.now());
        hub.setUpdatedAt(ZonedDateTime.now());

        Hub savedHub = hubRepository.save(hub);
        return toDetailResponse(savedHub);
    }

    /**
     * Update an existing hub
     */
    public HubDetailResponse updateHub(UUID id, HubUpdateRequest request) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hub not found with ID: " + id));

        // Check if the new name is already taken by another hub
        if (!hub.getName().equals(request.name())) {
            hubRepository.findByName(request.name()).ifPresent(existingHub -> {
                if (!existingHub.getId().equals(id)) {
                    throw new IllegalArgumentException("Hub with name '" + request.name() + "' already exists");
                }
            });
        }

        hub.setName(request.name());
        hub.setLocation(request.location());
        hub.setContactName(request.contactName());
        hub.setContactPhone(request.contactPhone());
        hub.setContactEmail(request.contactEmail());
        hub.setCity(request.city());
        hub.setRegion(request.region());
        hub.setAddress(request.address());
        hub.setLatitude(request.latitude());
        hub.setLongitude(request.longitude());
        if (request.status() != null) {
            hub.setStatus(request.status());
        }
        hub.setUpdatedAt(ZonedDateTime.now());

        Hub updatedHub = hubRepository.save(hub);
        return toDetailResponse(updatedHub);
    }

    /**
     * Toggle hub status between ACTIVE and INACTIVE
     */
    public HubDetailResponse toggleHubStatus(UUID id) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hub not found with ID: " + id));

        hub.setStatus(hub.getStatus() == HubStatus.ACTIVE ? HubStatus.INACTIVE : HubStatus.ACTIVE);
        hub.setUpdatedAt(ZonedDateTime.now());

        Hub updatedHub = hubRepository.save(hub);
        return toDetailResponse(updatedHub);
    }

    /**
     * Delete a hub
     */
    public void deleteHub(UUID id) {
        if (!hubRepository.existsById(id)) {
            throw new IllegalArgumentException("Hub not found with ID: " + id);
        }
        hubRepository.deleteById(id);
    }

    /**
     * Update hub status
     */
    public HubSummaryResponse updateHubStatus(UUID id, HubStatus status) {
        Hub hub = hubRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Hub not found with ID: " + id));
        
        hub.setStatus(status);
        hub.setUpdatedAt(ZonedDateTime.now());
        Hub savedHub = hubRepository.save(hub);
        return toSummaryResponse(savedHub);
    }

    /**
     * Get all distinct cities
     */
    @Transactional(readOnly = true)
    public List<String> getAllCities() {
        return hubRepository.findAllCities();
    }

    /**
     * Get all distinct regions
     */
    @Transactional(readOnly = true)
    public List<String> getAllRegions() {
        return hubRepository.findAllRegions();
    }

    // Helper methods to convert entities to DTOs
    private HubSummaryResponse toSummaryResponse(Hub hub) {
        return new HubSummaryResponse(
                hub.getId(),
                hub.getCode(),
                hub.getName(),
                hub.getLocation(),
                hub.getContactName(),
                hub.getContactPhone(),
                hub.getContactEmail(),
                hub.getCity(),
                hub.getRegion(),
                hub.getLatitude(),
                hub.getLongitude(),
                hub.getStatus()
        );
    }

    private HubDetailResponse toDetailResponse(Hub hub) {
        return new HubDetailResponse(
                hub.getId(),
                hub.getCode(),
                hub.getName(),
                hub.getLocation(),
                hub.getContactName(),
                hub.getContactPhone(),
                hub.getContactEmail(),
                hub.getCity(),
                hub.getRegion(),
                hub.getAddress(),
                hub.getLatitude(),
                hub.getLongitude(),
                hub.getStatus(),
                hub.getCreatedAt(),
                hub.getUpdatedAt()
        );
    }
}
