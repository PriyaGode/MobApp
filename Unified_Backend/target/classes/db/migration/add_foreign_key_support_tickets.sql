-- Add foreign key constraint from support_tickets.user_id to users.id

-- Step 1: Ensure user_id column is BIGINT to match users.id type
ALTER TABLE support_tickets 
ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

-- Step 2: Add foreign key constraint
ALTER TABLE support_tickets
ADD CONSTRAINT fk_support_tickets_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
