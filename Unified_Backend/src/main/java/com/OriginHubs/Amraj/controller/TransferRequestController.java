package com.OriginHubs.Amraj.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.dto.PagedResponse;
import com.OriginHubs.Amraj.dto.TransferRequestDecisionRequest;
import com.OriginHubs.Amraj.dto.TransferRequestResponse;
import com.OriginHubs.Amraj.entity.enums.TransferStatus;
import com.OriginHubs.Amraj.service.TransferRequestService;

@RestController
@RequestMapping("/api/admin/transfer-requests")
public class TransferRequestController {

    @Autowired
    private TransferRequestService transferRequestService;

    @GetMapping
    public ResponseEntity<PagedResponse<TransferRequestResponse>> getTransferRequests(
            @RequestParam(required = false) TransferStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<TransferRequestResponse> response = transferRequestService.getTransferRequests(status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending-count")
    public ResponseEntity<Map<String, Long>> getPendingCount() {
        long count = transferRequestService.getPendingCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/{requestId}/decision")
    public ResponseEntity<TransferRequestResponse> processTransferRequest(
            @PathVariable UUID requestId,
            @RequestBody TransferRequestDecisionRequest decision) {
        
        TransferRequestResponse response = transferRequestService.processTransferRequest(requestId, decision);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/dev/generate-sample-data")
    public ResponseEntity<Map<String, Object>> generateSampleTransferRequests() {
        try {
            int count = transferRequestService.generateSampleData();
            return ResponseEntity.ok(Map.of(
                "message", "Sample transfer requests generated successfully",
                "count", count
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to generate sample data: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/dev/clear-data")
    public ResponseEntity<Map<String, String>> clearTransferRequests() {
        try {
            transferRequestService.clearAllData();
            return ResponseEntity.ok(Map.of(
                "message", "All transfer requests cleared successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to clear data: " + e.getMessage()
            ));
        }
    }
}