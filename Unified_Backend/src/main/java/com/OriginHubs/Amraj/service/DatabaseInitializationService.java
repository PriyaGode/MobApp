package com.OriginHubs.Amraj.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DatabaseInitializationService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeDatabase() {
        createPromoCodesTableIfNotExists();
        addPromoCodeColumnsToOrdersIfNotExists();
        insertSamplePromoCodesIfEmpty();
    }

    private void createPromoCodesTableIfNotExists() {
        String checkTableQuery = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'promo_codes'";
        Integer count = jdbcTemplate.queryForObject(checkTableQuery, Integer.class);
        
        if (count == 0) {
            String createTableQuery = """
                CREATE TABLE promo_codes (
                    id BIGSERIAL PRIMARY KEY,
                    code VARCHAR(50) NOT NULL UNIQUE,
                    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
                    discount_value DECIMAL(10,2) NOT NULL,
                    min_order_amount DECIMAL(10,2),
                    max_discount_amount DECIMAL(10,2),
                    usage_limit INTEGER,
                    used_count INTEGER DEFAULT 0,
                    valid_from TIMESTAMP NOT NULL,
                    valid_until TIMESTAMP NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """;
            jdbcTemplate.execute(createTableQuery);
            System.out.println("Created promo_codes table");
        }
    }

    private void addPromoCodeColumnsToOrdersIfNotExists() {
        try {
            String checkColumnQuery = "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'promo_code'";
            Integer count = jdbcTemplate.queryForObject(checkColumnQuery, Integer.class);
            
            if (count == 0) {
                jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN promo_code VARCHAR(50)");
                jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2)");
                System.out.println("Added promo code columns to orders table");
            }
        } catch (Exception e) {
            System.out.println("Orders table might not exist yet or columns already added: " + e.getMessage());
        }
    }

    private void insertSamplePromoCodesIfEmpty() {
        try {
            String countQuery = "SELECT COUNT(*) FROM promo_codes";
            Integer count = jdbcTemplate.queryForObject(countQuery, Integer.class);
            
            if (count == 0) {
                String insertQuery = """
                    INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until) VALUES
                    ('WELCOME10', 'PERCENTAGE', 10.00, 100.00, 50.00, 100, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
                    ('SAVE50', 'FIXED', 50.00, 200.00, NULL, 50, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
                    ('FIRST20', 'PERCENTAGE', 20.00, 150.00, 100.00, 200, '2024-01-01 00:00:00', '2024-12-31 23:59:59')
                    """;
                jdbcTemplate.execute(insertQuery);
                System.out.println("Inserted sample promo codes");
            }
        } catch (Exception e) {
            System.out.println("Could not insert sample promo codes: " + e.getMessage());
        }
    }
}