-- Insert sample inventory items with correct status values
INSERT INTO inventory_items (id, hub_id, sku, product_name, quantity, reorder_level, status, unit_price, created_at, updated_at) VALUES
('28db6ac0-111e-452b-aa58-a5a4403d7d44', 'c5666399-b011-450a-bc2e-45f8dfa6e77e', 'MNG-001', 'Alphonso Mango', 100, 10, 'IN_STOCK', 1200, NOW(), NOW()),
('38db6ac0-111e-452b-aa58-a5a4403d7d45', 'c5666399-b011-450a-bc2e-45f8dfa6e77e', 'APL-001', 'Red Apple', 150, 15, 'IN_STOCK', 800, NOW(), NOW()),
('48db6ac0-111e-452b-aa58-a5a4403d7d46', 'c5666399-b011-450a-bc2e-45f8dfa6e77e', 'BAN-001', 'Yellow Banana', 200, 20, 'IN_STOCK', 600, NOW(), NOW()),
('58db6ac0-111e-452b-aa58-a5a4403d7d47', 'c5666399-b011-450a-bc2e-45f8dfa6e77e', 'ORG-001', 'Orange', 80, 15, 'IN_STOCK', 900, NOW(), NOW()),
('68db6ac0-111e-452b-aa58-a5a4403d7d48', 'c5666399-b011-450a-bc2e-45f8dfa6e77e', 'GRP-001', 'Green Grapes', 5, 10, 'LOW_STOCK', 1500, NOW(), NOW());