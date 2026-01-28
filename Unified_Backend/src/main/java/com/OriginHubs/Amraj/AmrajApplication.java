package com.OriginHubs.Amraj;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Unified Spring Boot Application Entry Point
 * Merges functionality from:
 * - CustomerPortal_Backend (Customer APIs)
 * - Superadmin_Backend (Admin APIs)
 *
 * API Prefixes:
 * - /api/customer/* - Customer facing APIs
 * - /api/admin/* - Admin/Superadmin APIs
 */
@SpringBootApplication(scanBasePackages = {
        "com.OriginHubs.Amraj",
        "com.OriginHubs.Amraj.customer"
})

@EnableJpaRepositories(basePackages = {
        "com.OriginHubs.Amraj.repository",
        "com.OriginHubs.Amraj.customer.repository"
})
@EntityScan(basePackages = {
        "com.OriginHubs.Amraj.model",
        "com.OriginHubs.Amraj.entity",
        "com.OriginHubs.Amraj.customer.model"
})
@ConfigurationPropertiesScan({
        "com.OriginHubs.Amraj.config",
        "com.OriginHubs.Amraj.customer.config"
})
public class AmrajApplication {
    public static void main(String[] args) {
        SpringApplication.run(AmrajApplication.class, args);
    }
}
