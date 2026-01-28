package com.OriginHubs.Amraj.customer.controller;

import com.OriginHubs.Amraj.customer.dto.ProductWithImagesDTO;
import com.OriginHubs.Amraj.customer.service.CustomerProductService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customer/products")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CustomerProductController {

    private final CustomerProductService productService;

    public CustomerProductController(CustomerProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductWithImagesDTO> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping(value = "/category/{category}", produces = "application/json")
    public List<ProductWithImagesDTO> getProductsByCategory(@PathVariable String category) {
        return productService.getProductsByCategory(category);
    }
}
