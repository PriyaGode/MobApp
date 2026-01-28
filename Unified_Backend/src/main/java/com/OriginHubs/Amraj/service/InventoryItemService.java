package com.OriginHubs.Amraj.service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.dto.InventoryItemCreateRequest;
import com.OriginHubs.Amraj.dto.InventoryItemResponse;
import com.OriginHubs.Amraj.dto.InventoryItemUpdateRequest;
import com.OriginHubs.Amraj.dto.StockTransferRequest;
import com.OriginHubs.Amraj.dto.UpdateQuantityRequest;
import com.OriginHubs.Amraj.entity.Hub;
import com.OriginHubs.Amraj.entity.InventoryItem;
import com.OriginHubs.Amraj.entity.enums.InventoryStatus;
import com.OriginHubs.Amraj.repository.HubManagementRepository;
import com.OriginHubs.Amraj.repository.InventoryItemRepository;

@Service
@Transactional
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final HubManagementRepository hubRepository;

    public InventoryItemService(InventoryItemRepository inventoryItemRepository, HubManagementRepository hubRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.hubRepository = hubRepository;
    }

    public List<InventoryItemResponse> getInventoryByHub(UUID hubId, String status, String search) {
        List<InventoryItem> items;

        if (status != null && !status.isEmpty() && search != null && !search.isEmpty()) {
            InventoryStatus inventoryStatus = InventoryStatus.valueOf(status.toUpperCase());
            items = inventoryItemRepository.findByHubIdAndStatusAndSearch(hubId, inventoryStatus, search);
        } else if (status != null && !status.isEmpty()) {
            InventoryStatus inventoryStatus = InventoryStatus.valueOf(status.toUpperCase());
            items = inventoryItemRepository.findByHubIdAndStatus(hubId, inventoryStatus);
        } else if (search != null && !search.isEmpty()) {
            items = inventoryItemRepository.findByHubIdAndSearch(hubId, search);
        } else {
            items = inventoryItemRepository.findByHubId(hubId);
        }

        return items.stream()
                .map(InventoryItemResponse::from)
                .collect(Collectors.toList());
    }

    public InventoryItemResponse getInventoryItem(UUID id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found with id: " + id));
        return InventoryItemResponse.from(item);
    }

    public InventoryItemResponse createInventoryItem(UUID hubId, InventoryItemCreateRequest request) {
        // Check if hub exists
        Hub hub = hubRepository.findById(hubId)
                .orElseThrow(() -> new IllegalArgumentException("Hub not found with id: " + hubId));

        // Check if SKU already exists for this hub
        if (inventoryItemRepository.findByHubIdAndSku(hubId, request.sku()).isPresent()) {
            throw new IllegalArgumentException("SKU already exists in this hub: " + request.sku());
        }

        InventoryItem item = new InventoryItem();
        item.setHub(hub);
        item.setSku(request.sku());
        item.setProductName(request.productName());
        item.setQuantity(request.quantity());
        item.setReorderLevel(request.reorderLevel());
        item.setDescription(request.description());
        item.setUnitPrice(request.unitPrice());
        item.setUnit(request.unit());

        if (request.quantity() > 0) {
            item.setLastRestocked(ZonedDateTime.now());
        }

        InventoryItem savedItem = inventoryItemRepository.save(item);
        return InventoryItemResponse.from(savedItem);
    }

    public InventoryItemResponse updateInventoryItem(UUID id, InventoryItemUpdateRequest request) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found with id: " + id));

        item.setProductName(request.productName());
        item.setQuantity(request.quantity());
        item.setReorderLevel(request.reorderLevel());
        item.setDescription(request.description());
        item.setUnitPrice(request.unitPrice());
        item.setUnit(request.unit());

        InventoryItem updatedItem = inventoryItemRepository.save(item);
        return InventoryItemResponse.from(updatedItem);
    }

    public InventoryItemResponse updateQuantity(UUID id, UpdateQuantityRequest request) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found with id: " + id));

        Integer oldQuantity = item.getQuantity();
        item.setQuantity(request.quantity());

        // Update last restocked time if quantity increased
        if (request.quantity() > oldQuantity) {
            item.setLastRestocked(ZonedDateTime.now());
        }

        InventoryItem updatedItem = inventoryItemRepository.save(item);
        return InventoryItemResponse.from(updatedItem);
    }

    public void markOutOfStock(UUID id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found with id: " + id));

        item.setQuantity(0);
        inventoryItemRepository.save(item);
    }

    public void transferStock(StockTransferRequest request) {
        // Validate source and destination are different
        if (request.sourceHubId().equals(request.destinationHubId())) {
            throw new IllegalArgumentException("Source and destination hubs must be different");
        }

        // Get source item
        InventoryItem sourceItem = inventoryItemRepository.findByHubIdAndSku(request.sourceHubId(), request.sku())
                .orElseThrow(() -> new IllegalArgumentException("Item not found in source hub"));

        // Check if source has enough quantity
        if (sourceItem.getQuantity() < request.quantity()) {
            throw new IllegalArgumentException("Insufficient quantity in source hub. Available: " + 
                                             sourceItem.getQuantity() + ", Requested: " + request.quantity());
        }

        // Check if destination hub exists
        Hub destinationHub = hubRepository.findById(request.destinationHubId())
                .orElseThrow(() -> new IllegalArgumentException("Destination hub not found"));

        // Reduce quantity from source
        sourceItem.setQuantity(sourceItem.getQuantity() - request.quantity());
        inventoryItemRepository.save(sourceItem);

        // Add to destination (create if doesn't exist)
        InventoryItem destinationItem = inventoryItemRepository
                .findByHubIdAndSku(request.destinationHubId(), request.sku())
                .orElseGet(() -> {
                    InventoryItem newItem = new InventoryItem();
                    newItem.setHub(destinationHub);
                    newItem.setSku(sourceItem.getSku());
                    newItem.setProductName(sourceItem.getProductName());
                    newItem.setQuantity(0);
                    newItem.setReorderLevel(sourceItem.getReorderLevel());
                    newItem.setDescription(sourceItem.getDescription());
                    newItem.setUnitPrice(sourceItem.getUnitPrice());
                    newItem.setUnit(sourceItem.getUnit());
                    return newItem;
                });

        destinationItem.setQuantity(destinationItem.getQuantity() + request.quantity());
        destinationItem.setLastRestocked(ZonedDateTime.now());
        inventoryItemRepository.save(destinationItem);
    }

    public void deleteInventoryItem(UUID id) {
        if (!inventoryItemRepository.existsById(id)) {
            throw new IllegalArgumentException("Inventory item not found with id: " + id);
        }
        inventoryItemRepository.deleteById(id);
    }

    public List<InventoryItemResponse> getLowStockItems(UUID hubId) {
        List<InventoryItem> items = inventoryItemRepository.findLowStockByHubId(hubId);
        return items.stream()
                .map(InventoryItemResponse::from)
                .collect(Collectors.toList());
    }
}
