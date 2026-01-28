package com.OriginHubs.Amraj.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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

import com.OriginHubs.Amraj.dto.InventoryItemCreateRequest;
import com.OriginHubs.Amraj.dto.InventoryItemResponse;
import com.OriginHubs.Amraj.dto.InventoryItemUpdateRequest;
import com.OriginHubs.Amraj.dto.StockTransferRequest;
import com.OriginHubs.Amraj.dto.UpdateQuantityRequest;
import com.OriginHubs.Amraj.entity.enums.AuditActionType;
import com.OriginHubs.Amraj.service.AuditLogService;
import com.OriginHubs.Amraj.service.InventoryItemService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/hubs/{hubId}/inventory")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;
    private final AuditLogService auditLogService;

    public InventoryItemController(InventoryItemService inventoryItemService, AuditLogService auditLogService) {
        this.inventoryItemService = inventoryItemService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<List<InventoryItemResponse>> getInventoryByHub(
            @PathVariable UUID hubId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        List<InventoryItemResponse> items = inventoryItemService.getInventoryByHub(hubId, status, search);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<InventoryItemResponse> getInventoryItem(
            @PathVariable UUID hubId,
            @PathVariable UUID itemId) {
        InventoryItemResponse item = inventoryItemService.getInventoryItem(itemId);
        return ResponseEntity.ok(item);
    }

    @PostMapping
    public ResponseEntity<InventoryItemResponse> createInventoryItem(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable UUID hubId,
            @Valid @RequestBody InventoryItemCreateRequest request) {
        InventoryItemResponse item = inventoryItemService.createInventoryItem(hubId, request);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.INVENTORY_TRANSFER, "InventoryItem", item.id().toString(), hubId, null, null, "API", "INFO", "Created inventory item " + item.productName(), null, item, null, null);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<InventoryItemResponse> updateInventoryItem(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable UUID hubId,
            @PathVariable UUID itemId,
            @Valid @RequestBody InventoryItemUpdateRequest request) {
        InventoryItemResponse before = inventoryItemService.getInventoryItem(itemId);
        InventoryItemResponse item = inventoryItemService.updateInventoryItem(itemId, request);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.INVENTORY_TRANSFER, "InventoryItem", item.id().toString(), hubId, null, null, "API", "INFO", "Updated inventory item " + item.productName(), before, item, null, null);
        }
        return ResponseEntity.ok(item);
    }

    @PatchMapping("/{itemId}/quantity")
    public ResponseEntity<InventoryItemResponse> updateQuantity(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable UUID hubId,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateQuantityRequest request) {
        InventoryItemResponse before = inventoryItemService.getInventoryItem(itemId);
        InventoryItemResponse item = inventoryItemService.updateQuantity(itemId, request);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.INVENTORY_TRANSFER, "InventoryItem", item.id().toString(), hubId, null, null, "API", "INFO", "Updated quantity for " + item.productName(), before, item, request, null);
        }
        return ResponseEntity.ok(item);
    }

    @PatchMapping("/{itemId}/mark-out-of-stock")
    public ResponseEntity<Void> markOutOfStock(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable UUID hubId,
            @PathVariable UUID itemId) {
        InventoryItemResponse before = inventoryItemService.getInventoryItem(itemId);
        inventoryItemService.markOutOfStock(itemId);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.INVENTORY_TRANSFER, "InventoryItem", itemId.toString(), hubId, null, null, "API", "INFO", "Marked out of stock " + (before != null ? before.productName() : itemId.toString()), before, null, null, null);
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteInventoryItem(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable UUID hubId,
            @PathVariable UUID itemId) {
        InventoryItemResponse before = inventoryItemService.getInventoryItem(itemId);
        inventoryItemService.deleteInventoryItem(itemId);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.INVENTORY_TRANSFER, "InventoryItem", itemId.toString(), hubId, null, null, "API", "INFO", "Deleted inventory item " + (before != null ? before.productName() : itemId.toString()), before, null, null, null);
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryItemResponse>> getLowStockItems(@PathVariable UUID hubId) {
        List<InventoryItemResponse> items = inventoryItemService.getLowStockItems(hubId);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transferStock(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable UUID hubId,
            @Valid @RequestBody StockTransferRequest request) {
        inventoryItemService.transferStock(request);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.INVENTORY_TRANSFER, "InventoryTransfer", request.sku(), request.destinationHubId(), null, null, "API", "INFO", "Transferred " + request.quantity() + " of " + request.sku() + " from " + request.sourceHubId() + " to " + request.destinationHubId(), null, request, null, null);
        }
        return ResponseEntity.ok().build();
    }
}
