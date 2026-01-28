package com.OriginHubs.Amraj.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.dto.HubCreateRequest;
import com.OriginHubs.Amraj.dto.HubDetailResponse;
import com.OriginHubs.Amraj.dto.HubStatusUpdateRequest;
import com.OriginHubs.Amraj.dto.HubSummaryResponse;
import com.OriginHubs.Amraj.dto.HubUpdateRequest;
import com.OriginHubs.Amraj.entity.enums.AuditActionType;
import com.OriginHubs.Amraj.entity.enums.HubStatus;
import com.OriginHubs.Amraj.service.AuditLogService;
import com.OriginHubs.Amraj.service.HubService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/hub-management")
public class HubManagementController {

    private final HubService hubService;
    private final AuditLogService auditLogService;

    public HubManagementController(HubService hubService, AuditLogService auditLogService) {
        this.hubService = hubService;
        this.auditLogService = auditLogService;
    }

    /**
     * GET /api/hubs?status=ACTIVE&search=xyz
     * List all hubs with optional filtering
     */
    @GetMapping
    public ResponseEntity<List<HubSummaryResponse>> listHubs(
            @RequestParam(required = false) HubStatus status,
            @RequestParam(required = false) String search) {
        List<HubSummaryResponse> hubs = hubService.getAllHubs(status, search);
        return ResponseEntity.ok(hubs);
    }

    /**
     * GET /api/hubs/grouped?status=ACTIVE&search=xyz
     * Get hubs grouped by city/region
     */
    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<HubSummaryResponse>>> listHubsGrouped(
            @RequestParam(required = false) HubStatus status,
            @RequestParam(required = false) String search) {
        Map<String, List<HubSummaryResponse>> groupedHubs = hubService.getHubsGroupedByCity(status, search);
        return ResponseEntity.ok(groupedHubs);
    }

    /**
     * GET /api/hubs/{id}
     * Get hub details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HubDetailResponse> getHub(@PathVariable UUID id) {
        HubDetailResponse hub = hubService.getHubById(id);
        return ResponseEntity.ok(hub);
    }

    /**
     * GET /api/hubs/code/{code}
     * Get hub details by code
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<HubDetailResponse> getHubByCode(@PathVariable String code) {
        HubDetailResponse hub = hubService.getHubByCode(code);
        return ResponseEntity.ok(hub);
    }

    /**
     * POST /api/hubs
     * Create a new hub
     */
    @PostMapping
    public ResponseEntity<HubDetailResponse> createHub(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
                                                       @Valid @RequestBody HubCreateRequest request) {
        HubDetailResponse createdHub = hubService.createHub(request);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.HUB_EDIT, "Hub", createdHub.id().toString(), createdHub.id(), null, null, "API", "INFO", "Created hub " + createdHub.name(), null, createdHub, null, null);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(createdHub);
    }

    /**
     * PUT /api/hubs/{id}
     * Update an existing hub
     */
    @PutMapping("/{id}")
    public ResponseEntity<HubDetailResponse> updateHub(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody HubUpdateRequest request) {
        // capture old state if possible
        HubDetailResponse before = hubService.getHubById(id);
        HubDetailResponse updatedHub = hubService.updateHub(id, request);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.HUB_EDIT, "Hub", id.toString(), updatedHub.id(), null, null, "API", "INFO", "Updated hub " + updatedHub.name(), before, updatedHub, null, null);
        }
        return ResponseEntity.ok(updatedHub);
    }

    /**
     * PATCH /api/hubs/{id}/toggle-status
     * Toggle hub status between ACTIVE and INACTIVE
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<HubDetailResponse> toggleStatus(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId, @PathVariable UUID id) {
        HubDetailResponse before = hubService.getHubById(id);
        HubDetailResponse updatedHub = hubService.toggleHubStatus(id);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.HUB_EDIT, "Hub", id.toString(), updatedHub.id(), null, null, "API", "INFO", "Toggled hub status for " + updatedHub.name(), before, updatedHub, null, null);
        }
        return ResponseEntity.ok(updatedHub);
    }

    /**
     * PUT /api/hubs/{id}/status
     * Update hub status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<HubSummaryResponse> updateHubStatus(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable UUID id,
            @RequestBody HubStatusUpdateRequest request) {
        HubSummaryResponse response = hubService.updateHubStatus(id, request.getStatus());
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.HUB_EDIT, "Hub", id.toString(), response.id(), null, null, "API", "INFO", "Updated hub status to " + request.getStatus(), null, response, null, null);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/hubs/{id}
     * Delete a hub
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHub(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId, @PathVariable UUID id) {
        HubDetailResponse before = null;
        try { before = hubService.getHubById(id); } catch (Exception ignored) {}
        hubService.deleteHub(id);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.HUB_EDIT, "Hub", id.toString(), id, null, null, "API", "INFO", "Deleted hub " + (before != null ? before.name() : id.toString()), before, null, null, null);
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/hubs/meta/cities
     * Get all distinct cities
     */
    @GetMapping("/meta/cities")
    public ResponseEntity<List<String>> getCities() {
        List<String> cities = hubService.getAllCities();
        return ResponseEntity.ok(cities);
    }

    /**
     * GET /api/hubs/meta/regions
     * Get all distinct regions
     */
    @GetMapping("/meta/regions")
    public ResponseEntity<List<String>> getRegions() {
        List<String> regions = hubService.getAllRegions();
        return ResponseEntity.ok(regions);
    }
}
