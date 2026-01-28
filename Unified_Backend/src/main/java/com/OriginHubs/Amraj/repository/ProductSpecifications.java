package com.OriginHubs.Amraj.repository;

import org.springframework.data.jpa.domain.Specification;

import com.OriginHubs.Amraj.model.Product;

public class ProductSpecifications {

    public static Specification<Product> hasCategory(String category) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("category"), category);
    }

    public static Specification<Product> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Product> searchByNameOrVarietyOrOrigin(String search) {
        return (root, query, criteriaBuilder) -> {
            String likePattern = "%" + search.toLowerCase() + "%";
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("variety")), likePattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("origin")), likePattern)
            );
        };
    }
}
