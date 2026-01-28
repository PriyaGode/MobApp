-- Create transfer_requests table
CREATE TABLE IF NOT EXISTS transfer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(255) UNIQUE NOT NULL,
    source_hub_id UUID NOT NULL,
    destination_hub_id UUID NOT NULL,
    inventory_item_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    requested_by VARCHAR(255),
    approved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    CONSTRAINT fk_transfer_source_hub FOREIGN KEY (source_hub_id) REFERENCES hubs(id),
    CONSTRAINT fk_transfer_destination_hub FOREIGN KEY (destination_hub_id) REFERENCES hubs(id),
    CONSTRAINT fk_transfer_inventory_item FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transfer_requests_status ON transfer_requests(status);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_created_at ON transfer_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_source_hub ON transfer_requests(source_hub_id);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_destination_hub ON transfer_requests(destination_hub_id);