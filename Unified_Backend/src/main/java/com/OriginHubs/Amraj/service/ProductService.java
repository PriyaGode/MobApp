package com.OriginHubs.Amraj.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.OriginHubs.Amraj.model.BulkUploadResponse;
import com.OriginHubs.Amraj.model.Product;
import com.OriginHubs.Amraj.model.ProductHubVisibility;
import com.OriginHubs.Amraj.model.ProductRequest;
import com.OriginHubs.Amraj.model.StockSyncResponse;
import com.OriginHubs.Amraj.repository.HubRepository;
import com.OriginHubs.Amraj.repository.ProductHubVisibilityRepository;
import com.OriginHubs.Amraj.repository.ProductRepository;
import com.OriginHubs.Amraj.repository.ProductSpecifications;
import com.OriginHubs.Amraj.entity.Hub;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final HubRepository hubRepository;
    private final ProductHubVisibilityRepository productHubVisibilityRepository;

    public ProductService(ProductRepository productRepository, HubRepository hubRepository, ProductHubVisibilityRepository productHubVisibilityRepository) {
        this.productRepository = productRepository;
        this.hubRepository = hubRepository;
        this.productHubVisibilityRepository = productHubVisibilityRepository;
    }

    public List<Product> getAllProducts(String category, String status, String search, String sortBy) {
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();
        
        if (category != null && !category.isEmpty()) {
            spec = spec.and(ProductSpecifications.hasCategory(category));
        }
        if (status != null && !status.isEmpty()) {
            spec = spec.and(ProductSpecifications.hasStatus(status));
        }
        if (search != null && !search.isEmpty()) {
            spec = spec.and(ProductSpecifications.searchByNameOrVarietyOrOrigin(search));
        }
        
        Sort sort;
        if ("price".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("stock".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "stock");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "id");
        }

        return productRepository.findAll(spec, sort);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(ProductRequest request) {
        Product newProduct = new Product();
        newProduct.setName(request.getName());
        newProduct.setCategory(request.getCategory());
        newProduct.setVariety(request.getVariety());
        newProduct.setOrigin(request.getOrigin());
        newProduct.setDescription(request.getDescription());
        newProduct.setPrice(request.getPrice());
        newProduct.setStock(request.getStock());
    newProduct.setAvailableKg(request.getAvailableKg() != null ? request.getAvailableKg().doubleValue() : null);
        newProduct.setImageUrl(request.getImageUrl());
        newProduct.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        newProduct.setHubVisibility(request.getHubVisibility());

        Product savedProduct = productRepository.save(newProduct);
        
        if (request.getHubVisibility() != null && !request.getHubVisibility().equals("ALL")) {
            String[] hubIds = request.getHubVisibility().split(",");
            int stockPerHub = request.getStock() / hubIds.length;
            int remainder = request.getStock() % hubIds.length;
            
            for (int i = 0; i < hubIds.length; i++) {
                try {
                    ProductHubVisibility visibility = new ProductHubVisibility();
                    visibility.setProductId(savedProduct.getId());
                    visibility.setHubId(java.util.UUID.fromString(hubIds[i].trim()));
                    visibility.setStock(stockPerHub + (i == 0 ? remainder : 0));
                    productHubVisibilityRepository.save(visibility);
                } catch (IllegalArgumentException e) {
                }
            }
        }
        
        return savedProduct;
    }

    public Optional<Product> updateProduct(Long id, ProductRequest request) {
        return productRepository.findById(id).map(existingProduct -> {
            Integer oldStock = existingProduct.getStock();
            
            existingProduct.setName(request.getName());
            existingProduct.setCategory(request.getCategory());
            existingProduct.setVariety(request.getVariety());
            existingProduct.setOrigin(request.getOrigin());
            existingProduct.setDescription(request.getDescription());
            existingProduct.setPrice(request.getPrice());
            existingProduct.setStock(request.getStock());
            existingProduct.setAvailableKg(request.getAvailableKg() != null ? request.getAvailableKg().doubleValue() : null);
            existingProduct.setImageUrl(request.getImageUrl());
            existingProduct.setStatus(request.getStatus());
            existingProduct.setHubVisibility(request.getHubVisibility());
            
            Product savedProduct = productRepository.save(existingProduct);
            
            // Update product_hub_visibility if stock changed
            List<ProductHubVisibility> existingVisibilities = productHubVisibilityRepository.findByProductId(id);
            if (!existingVisibilities.isEmpty() && !request.getStock().equals(oldStock)) {
                int newStock = request.getStock();
                int hubCount = existingVisibilities.size();
                int stockPerHub = newStock / hubCount;
                int remainder = newStock % hubCount;
                
                for (int i = 0; i < existingVisibilities.size(); i++) {
                    ProductHubVisibility visibility = existingVisibilities.get(i);
                    visibility.setStock(stockPerHub + (i == 0 ? remainder : 0));
                    productHubVisibilityRepository.save(visibility);
                }
            }
            
            if (request.getHubVisibility() != null && !request.getHubVisibility().equals("ALL")) {
                productHubVisibilityRepository.deleteAll(existingVisibilities);
                
                String[] hubIds = request.getHubVisibility().split(",");
                int stockPerHub = request.getStock() / hubIds.length;
                int remainder = request.getStock() % hubIds.length;
                
                for (int i = 0; i < hubIds.length; i++) {
                    try {
                        ProductHubVisibility visibility = new ProductHubVisibility();
                        visibility.setProductId(savedProduct.getId());
                        visibility.setHubId(java.util.UUID.fromString(hubIds[i].trim()));
                        visibility.setStock(stockPerHub + (i == 0 ? remainder : 0));
                        productHubVisibilityRepository.save(visibility);
                    } catch (IllegalArgumentException e) {
                    }
                }
            }
            
            return savedProduct;
        });
    }

    public void deleteProduct(Long id) {
        productRepository.findById(id).ifPresent(product -> {
            product.setStatus("ARCHIVED");
            productRepository.save(product);
        });
    }

    public Optional<Product> updateProductStatus(Long id, String status) {
        return productRepository.findById(id).map(product -> {
            product.setStatus(status);
            return productRepository.save(product);
        });
    }

    public StockSyncResponse syncProductStock(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        List<Hub> allHubs = hubRepository.findAll();
        List<ProductHubVisibility> hubVisibilities = productHubVisibilityRepository.findByProductId(productId);
        
        List<StockSyncResponse.HubStockInfo> hubStockInfos = new ArrayList<>();
        List<String> lowStockWarnings = new ArrayList<>();
        int totalStock = 0;
        int lowStockThreshold = 25;

        for (Hub hub : allHubs) {
            ProductHubVisibility visibility = hubVisibilities.stream()
                .filter(hv -> hv.getHubId() != null && hv.getHubId().equals(hub.getId()))
                .findFirst()
                .orElse(null);

            int quantity = visibility != null && visibility.getStock() != null ? visibility.getStock() : 0;
            boolean isLowStock = quantity <= lowStockThreshold;

            if (isLowStock && quantity > 0) {
                lowStockWarnings.add(hub.getName() + " (" + hub.getLocation() + "): Only " + quantity + " units left");
            }

            hubStockInfos.add(new StockSyncResponse.HubStockInfo(
                hub.getId().toString(),
                hub.getName(),
                hub.getLocation(),
                quantity,
                lowStockThreshold,
                isLowStock
            ));

            totalStock += quantity;
        }

        product.setStock(totalStock);
        productRepository.save(product);

        StockSyncResponse response = new StockSyncResponse();
        response.setProductId(productId);
        response.setProductName(product.getName());
        response.setTotalStock(totalStock);
        response.setHubStocks(hubStockInfos);
        response.setLowStockWarnings(lowStockWarnings);

        return response;
    }

    public BulkUploadResponse saveBulkProducts(MultipartFile file) {
        List<Map<String, Object>> errorList = new ArrayList<>();
        int successCount = 0;

        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
             CSVParser csvParser = new CSVParser(fileReader,
                     CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).build());) {

            Iterable<CSVRecord> csvRecords = csvParser.getRecords();

            for (CSVRecord csvRecord : csvRecords) {
                try {
                    String name = csvRecord.get("Name");
                    if (name == null || name.trim().isEmpty()) {
                        throw new IllegalArgumentException("Name is mandatory.");
                    }
                    if (productRepository.findByName(name).isPresent()) {
                        throw new IllegalArgumentException("Product with name '" + name + "' already exists.");
                    }

                    Product product = new Product();
                    product.setName(name);
                    product.setCategory(csvRecord.get("Category"));
                    product.setVariety(csvRecord.get("Variety"));
                    product.setOrigin(csvRecord.get("Origin"));
                    product.setDescription(csvRecord.get("Description"));
                    product.setPrice(Double.parseDouble(csvRecord.get("Price")));
                    product.setStock(Integer.parseInt(csvRecord.get("Stock")));
                    product.setAvailableKg(Double.parseDouble(csvRecord.get("AvailableKg")));
                    product.setImageUrl(csvRecord.get("ImageUrl"));

                    productRepository.save(product);
                    successCount++;
                } catch (Exception e) {
                    Map<String, Object> errorDetails = new HashMap<>();
                    errorDetails.put("row", csvRecord.getRecordNumber() + 1);
                    errorDetails.put("error", e.getMessage());
                    errorDetails.put("data", csvRecord.toMap());
                    errorList.add(errorDetails);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }
        return new BulkUploadResponse(successCount, errorList.size(), errorList);
    }

    public Optional<Product> updateProductVisibility(Long id, String hubVisibility) {
        return productRepository.findById(id).map(product -> {
            product.setHubVisibility(hubVisibility);
            Product saved = productRepository.save(product);

            List<ProductHubVisibility> existing = productHubVisibilityRepository.findByProductId(id);
            productHubVisibilityRepository.deleteAll(existing);

            if (hubVisibility != null && !hubVisibility.equals("ALL") && !hubVisibility.isBlank()) {
                String[] hubIds = hubVisibility.split(",");
                int totalStock = product.getStock() != null ? product.getStock() : 0;
                int stockPerHub = hubIds.length > 0 ? totalStock / hubIds.length : 0;
                int remainder = hubIds.length > 0 ? totalStock % hubIds.length : 0;

                for (int i = 0; i < hubIds.length; i++) {
                    try {
                        ProductHubVisibility visibility = new ProductHubVisibility();
                        visibility.setProductId(saved.getId());
                        visibility.setHubId(java.util.UUID.fromString(hubIds[i].trim()));
                        visibility.setStock(stockPerHub + (i == 0 ? remainder : 0));
                        productHubVisibilityRepository.save(visibility);
                    } catch (IllegalArgumentException e) {
                    }
                }
            }

            return saved;
        });
    }
}
