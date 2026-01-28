-- Create promo_codes table
CREATE TABLE promo_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add promo code fields to orders table
ALTER TABLE orders 
ADD COLUMN promo_code VARCHAR(50),
ADD COLUMN discount_amount DECIMAL(10,2);

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_until) VALUES
('WELCOME10', 'PERCENTAGE', 10.00, 100.00, 50.00, 100, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
('SAVE50', 'FIXED', 50.00, 200.00, NULL, 50, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
('FIRST20', 'PERCENTAGE', 20.00, 150.00, 100.00, 200, '2024-01-01 00:00:00', '2024-12-31 23:59:59');