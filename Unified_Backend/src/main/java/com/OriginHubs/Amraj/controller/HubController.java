package com.OriginHubs.Amraj.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.dto.HubCreateRequest;
import com.OriginHubs.Amraj.dto.HubDetailResponse;
import com.OriginHubs.Amraj.dto.HubStatusUpdateRequest;
import com.OriginHubs.Amraj.dto.HubSummaryResponse;
import com.OriginHubs.Amraj.dto.HubUpdateRequest;
import com.OriginHubs.Amraj.entity.Hub;
import com.OriginHubs.Amraj.entity.enums.HubStatus;
import com.OriginHubs.Amraj.repository.HubRepository;
import com.OriginHubs.Amraj.service.HubService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/hubs")
public class HubController {

    @Autowired
    private HubRepository hubRepository;
    
    @Autowired
    private HubService hubService;

    @GetMapping
    public List<Hub> getAllHubs() {
        return hubRepository.findAll();
    }
    
    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<HubSummaryResponse>>> listHubsGrouped(
            @RequestParam(required = false) HubStatus status,
            @RequestParam(required = false) String search) {
        Map<String, List<HubSummaryResponse>> groupedHubs = hubService.getHubsGroupedByCity(status, search);
        return ResponseEntity.ok(groupedHubs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<HubDetailResponse> getHub(@PathVariable UUID id) {
        HubDetailResponse hub = hubService.getHubById(id);
        return ResponseEntity.ok(hub);
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<HubDetailResponse> getHubByCode(@PathVariable String code) {
        HubDetailResponse hub = hubService.getHubByCode(code);
        return ResponseEntity.ok(hub);
    }
    
    @PostMapping
    public ResponseEntity<HubDetailResponse> createHub(@Valid @RequestBody HubCreateRequest request) {
        HubDetailResponse createdHub = hubService.createHub(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdHub);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<HubDetailResponse> updateHub(
            @PathVariable UUID id,
            @Valid @RequestBody HubUpdateRequest request) {
        HubDetailResponse updatedHub = hubService.updateHub(id, request);
        return ResponseEntity.ok(updatedHub);
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<HubSummaryResponse> updateHubStatus(
            @PathVariable UUID id,
            @Valid @RequestBody HubStatusUpdateRequest request) {
        HubSummaryResponse updatedHub = hubService.updateHubStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedHub);
    }
    
    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<HubDetailResponse> toggleHubStatus(@PathVariable UUID id) {
        HubDetailResponse updatedHub = hubService.toggleHubStatus(id);
        return ResponseEntity.ok(updatedHub);
    }
    
    @GetMapping("/meta/cities")
    public ResponseEntity<List<String>> getCities() {
        List<String> cities = hubService.getAllCities();
        return ResponseEntity.ok(cities);
    }
    
    @GetMapping("/meta/regions")
    public ResponseEntity<List<String>> getRegions() {
        List<String> regions = hubService.getAllRegions();
        return ResponseEntity.ok(regions);
    }
}
