ALTER TABLE support_tickets 
ADD COLUMN ticket_number VARCHAR(10) UNIQUE NOT NULL DEFAULT '';

UPDATE support_tickets 
SET ticket_number = CONCAT('TK-', LPAD(id, 5, '0')) 
WHERE ticket_number = '';

ALTER TABLE support_tickets 
ALTER COLUMN ticket_number DROP DEFAULT;
