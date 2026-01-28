package com.OriginHubs.Amraj.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class DataMigrationController {

    private final JdbcTemplate jdbcTemplate;

    public DataMigrationController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/migrate-to-mangoes")
    public String migrateToMangoes() {
        int updated = 0;
        
        // Update Laptop to Alphonso Mango
        updated += jdbcTemplate.update(
            "UPDATE inventory_items SET product_name = ?, unit_price = ?, unit = ?, description = ? WHERE product_name = ?",
            "Alphonso Mango", 12.99, "kg", "Premium quality fresh mangoes", "Laptop Dell XPS 15"
        );
        
        // Update Monitor to Kesar Mango
        updated += jdbcTemplate.update(
            "UPDATE inventory_items SET product_name = ?, unit_price = ?, unit = ?, description = ? WHERE product_name = ?",
            "Kesar Mango", 14.99, "kg", "Premium quality fresh mangoes", "Monitor LG 27\""
        );
        
        // Update Keyboard to Totapuri Mango
        updated += jdbcTemplate.update(
            "UPDATE inventory_items SET product_name = ?, unit_price = ?, unit = ?, description = ? WHERE product_name = ?",
            "Totapuri Mango", 8.99, "kg", "Premium quality fresh mangoes", "Keyboard Logitech MX"
        );
        
        // Update Mouse to Banganapalli Mango
        updated += jdbcTemplate.update(
            "UPDATE inventory_items SET product_name = ?, unit_price = ?, unit = ?, description = ? WHERE product_name = ?",
            "Banganapalli Mango", 10.99, "kg", "Premium quality fresh mangoes", "Mouse Wireless"
        );
        
        // Update USB Cable to Dasheri Mango
        updated += jdbcTemplate.update(
            "UPDATE inventory_items SET product_name = ?, unit_price = ?, unit = ?, description = ? WHERE product_name = ?",
            "Dasheri Mango", 9.99, "kg", "Premium quality fresh mangoes", "USB Cable Type-C"
        );
        
        return "Migration completed! Updated " + updated + " inventory items from electronics to mangoes.";
    }
}
