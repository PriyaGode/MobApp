package com.OriginHubs.Amraj.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.OriginHubs.Amraj.entity.enums.AuditActionType;
import com.OriginHubs.Amraj.model.BulkUploadResponse;
import com.OriginHubs.Amraj.model.Product;
import com.OriginHubs.Amraj.model.ProductRequest;
import com.OriginHubs.Amraj.model.StockSyncResponse;
import com.OriginHubs.Amraj.service.AuditLogService;
import com.OriginHubs.Amraj.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/products")
public class ProductController {

    private final ProductService productService;
    private final AuditLogService auditLogService;

    public ProductController(ProductService productService, AuditLogService auditLogService) {
        this.productService = productService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<Product> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "id") String sortBy) {
        return productService.getAllProducts(category, status, search, sortBy);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId, @Valid @RequestBody ProductRequest request) {
        Product createdProduct = productService.createProduct(request);
        if (userId != null) {
            auditLogService.recordAction(userId, AuditActionType.PRODUCT_UPDATE, "Product", String.valueOf(createdProduct.getId()), null, null, null, "API", "INFO", "Created product " + createdProduct.getName(), null, createdProduct, null, null);
        }
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId, @PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        Product before = productService.getProductById(id).orElse(null);
        var opt = productService.updateProduct(id, request);
        opt.ifPresent(updated -> {
            if (userId != null) {
                auditLogService.recordAction(userId, AuditActionType.PRODUCT_UPDATE, "Product", String.valueOf(id), null, null, null, "API", "INFO", "Updated product " + updated.getName(), before, updated, null, null);
            }
        });
        return opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId, @PathVariable Long id) {
        Product before = productService.getProductById(id).orElse(null);
        productService.deleteProduct(id);
        if (userId != null) {
            String name = before != null ? before.getName() : String.valueOf(id);
            auditLogService.recordAction(userId, AuditActionType.PRODUCT_UPDATE, "Product", String.valueOf(id), null, null, null, "API", "INFO", "Deleted product " + name, before, null, null, null);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Product> updateProductStatus(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId, @PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        String newStatus = statusUpdate.get("status");
        if (newStatus == null || (!newStatus.equals("ACTIVE") && !newStatus.equals("DRAFT") && !newStatus.equals("ARCHIVED"))) {
            return ResponseEntity.badRequest().build();
        }
        var opt = productService.updateProductStatus(id, newStatus);
        opt.ifPresent(p -> {
            if (userId != null) {
                auditLogService.recordAction(userId, AuditActionType.PRODUCT_UPDATE, "Product", String.valueOf(id), null, null, null, "API", "INFO", "Updated product status to " + newStatus, null, p, null, null);
            }
        });
        return opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/visibility")
    public ResponseEntity<Product> updateProductVisibility(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId, @PathVariable Long id, @RequestBody Map<String, String> visibilityUpdate) {
        String hubVisibility = visibilityUpdate.get("hubVisibility");
        if (hubVisibility == null || hubVisibility.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        var opt = productService.updateProductVisibility(id, hubVisibility);
        opt.ifPresent(p -> {
            if (userId != null) {
                auditLogService.recordAction(userId, AuditActionType.PRODUCT_UPDATE, "Product", String.valueOf(id), null, null, null, "API", "INFO", "Updated product visibility", null, p, null, null);
            }
        });
        return opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUploadProducts(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Please select a file to upload."));
        }
        try {
            BulkUploadResponse response = productService.saveBulkProducts(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to process file: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/stock-sync")
    public ResponseEntity<StockSyncResponse> syncProductStock(@PathVariable Long id) {
        try {
            StockSyncResponse response = productService.syncProductStock(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
