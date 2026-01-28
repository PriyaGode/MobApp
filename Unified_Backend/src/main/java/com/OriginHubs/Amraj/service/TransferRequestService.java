package com.OriginHubs.Amraj.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.dto.PagedResponse;
import com.OriginHubs.Amraj.dto.TransferRequestDecisionRequest;
import com.OriginHubs.Amraj.dto.TransferRequestResponse;
import com.OriginHubs.Amraj.entity.InventoryItem;
import com.OriginHubs.Amraj.entity.TransferRequest;
import com.OriginHubs.Amraj.entity.enums.TransferStatus;
import com.OriginHubs.Amraj.repository.InventoryItemRepository;
import com.OriginHubs.Amraj.repository.TransferRequestRepository;

@Service
public class TransferRequestService {

    @Autowired
    private TransferRequestRepository transferRequestRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;
    
    @Autowired
    private com.OriginHubs.Amraj.repository.HubManagementRepository hubRepository;

    @Transactional(readOnly = true)
    public PagedResponse
    
    
    
    
    <TransferRequestResponse> getTransferRequests(TransferStatus status, Pageable pageable) {
        Page<TransferRequest> page = (status != null) 
            ? transferRequestRepository.findByStatus(status, pageable)
            : transferRequestRepository.findAll(pageable);

        return new PagedResponse<>(
            page.getContent().stream().map(this::mapToResponse).toList(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.hasNext(),
            page.hasPrevious()
        );
    }

    public long getPendingCount() {
        return transferRequestRepository.countByStatus(TransferStatus.PENDING);
    }

    @Transactional
    public TransferRequestResponse processTransferRequest(UUID requestId, TransferRequestDecisionRequest decision) {
        TransferRequest request = transferRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Transfer request not found"));

        if (request.getStatus() != TransferStatus.PENDING) {
            throw new RuntimeException("Transfer request is not pending");
        }

        request.setStatus(decision.getDecision());
        request.setApprovedBy(decision.getApprovedBy());
        request.setNotes(decision.getNotes());

        if (decision.getDecision() == TransferStatus.APPROVED) {
            // Update inventory quantities
            updateInventoryForApprovedTransfer(request);
        }

        TransferRequest saved = transferRequestRepository.save(request);
        return mapToResponse(saved);
    }

    private void updateInventoryForApprovedTransfer(TransferRequest request) {
        // Find source inventory item
        InventoryItem sourceItem = inventoryItemRepository
            .findByHubIdAndSku(request.getSourceHub().getId(), request.getInventoryItem().getSku())
            .orElseThrow(() -> new RuntimeException("Source inventory item not found"));

        // Check if source has enough quantity
        if (sourceItem.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient quantity in source hub");
        }

        // Reduce quantity from source
        sourceItem.setQuantity(sourceItem.getQuantity() - request.getQuantity());
        inventoryItemRepository.save(sourceItem);

        // Find or create destination inventory item
        InventoryItem destItem = inventoryItemRepository
            .findByHubIdAndSku(request.getDestinationHub().getId(), request.getInventoryItem().getSku())
            .orElse(new InventoryItem(
                request.getInventoryItem().getSku(),
                request.getInventoryItem().getProductName(),
                0,
                request.getDestinationHub()
            ));

        // Add quantity to destination
        destItem.setQuantity(destItem.getQuantity() + request.getQuantity());
        inventoryItemRepository.save(destItem);
    }

    @Transactional
    public int generateSampleData() {
        // This method generates sample transfer requests using existing hubs and inventory items
        // It will only work if you have existing data in hubs and inventory_items tables
        
        java.util.List<com.OriginHubs.Amraj.entity.Hub> hubs = hubRepository.findAll();
        
        java.util.List<InventoryItem> inventoryItems = inventoryItemRepository.findAll();
        
        if (hubs.size() < 2) {
            throw new RuntimeException("Need at least 2 hubs to create transfer requests");
        }
        
        if (inventoryItems.isEmpty()) {
            throw new RuntimeException("Need inventory items to create transfer requests");
        }
        
        java.util.Random random = new java.util.Random();
        java.util.List<TransferRequest> requests = new java.util.ArrayList<>();
        
        String[] requesters = {
            "admin@amraj.com", "hub.manager@amraj.com", "warehouse@amraj.com", 
            "logistics@amraj.com", "staff@amraj.com"
        };
        
        String[] approvers = {
            "admin@amraj.com", "supervisor@amraj.com", "manager@amraj.com"
        };
        
        TransferStatus[] statuses = TransferStatus.values();
        
        // Generate 10 sample transfer requests
        for (int i = 0; i < 10; i++) {
            com.OriginHubs.Amraj.entity.Hub sourceHub = hubs.get(random.nextInt(hubs.size()));
            com.OriginHubs.Amraj.entity.Hub destHub;
            
            // Ensure different source and destination hubs
            do {
                destHub = hubs.get(random.nextInt(hubs.size()));
            } while (destHub.getId().equals(sourceHub.getId()));
            
            InventoryItem item = inventoryItems.get(random.nextInt(inventoryItems.size()));
            int quantity = random.nextInt(50) + 1; // 1-50 items
            TransferStatus status = statuses[random.nextInt(statuses.length)];
            String requester = requesters[random.nextInt(requesters.length)];
            
            TransferRequest request = new TransferRequest();
            request.setRequestId("TR-" + System.currentTimeMillis() + "-" + String.format("%03d", i + 1));
            request.setSourceHub(sourceHub);
            request.setDestinationHub(destHub);
            request.setInventoryItem(item);
            request.setQuantity(quantity);
            request.setStatus(status);
            request.setRequestedBy(requester);
            
            if (status != TransferStatus.PENDING) {
                request.setApprovedBy(approvers[random.nextInt(approvers.length)]);
            }
            
            // Set creation time in the past (last 7 days)
            java.time.LocalDateTime createdAt = java.time.LocalDateTime.now()
                .minusDays(random.nextInt(7))
                .minusHours(random.nextInt(24));
            request.setCreatedAt(createdAt);
            
            if (status != TransferStatus.PENDING) {
                request.setUpdatedAt(createdAt.plusHours(random.nextInt(48)));
            }
            
            // Add appropriate notes based on status
            switch (status) {
                case PENDING:
                    request.setNotes("Transfer request awaiting approval");
                    break;
                case APPROVED:
                    request.setNotes("Transfer approved and ready for processing");
                    break;
                case REJECTED:
                    request.setNotes("Transfer rejected due to insufficient stock or policy violation");
                    break;
                case COMPLETED:
                    request.setNotes("Transfer completed successfully");
                    break;
            }
            
            requests.add(request);
        }
        
        transferRequestRepository.saveAll(requests);
        return requests.size();
    }
    
    @Transactional
    public void clearAllData() {
        transferRequestRepository.deleteAll();
    }

    private TransferRequestResponse mapToResponse(TransferRequest request) {
        TransferRequestResponse response = new TransferRequestResponse();
        response.setId(request.getId().toString());
        response.setRequestId(request.getRequestId());
        response.setSourceHubName(request.getSourceHub().getName());
        response.setSourceHubCode(request.getSourceHub().getCode());
        response.setDestinationHubName(request.getDestinationHub().getName());
        response.setDestinationHubCode(request.getDestinationHub().getCode());
        response.setSku(request.getInventoryItem().getSku());
        response.setItemName(request.getInventoryItem().getProductName());
        response.setQuantity(request.getQuantity());
        response.setStatus(request.getStatus());
        response.setRequestedBy(request.getRequestedBy());
        response.setApprovedBy(request.getApprovedBy());
        response.setCreatedAt(request.getCreatedAt());
        response.setUpdatedAt(request.getUpdatedAt());
        response.setNotes(request.getNotes());
        return response;
    }
}