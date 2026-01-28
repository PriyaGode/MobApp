-- Migration script to add foreign key constraint from support_tickets.user_id to users.id
-- This ensures referential integrity between support tickets and users

-- Step 1: Check if there are any orphaned tickets (tickets with invalid user_id)
-- Uncomment to see orphaned records before migration:
-- SELECT id, user_id, subject FROM support_tickets 
-- WHERE user_id NOT IN (SELECT id::text FROM users);

-- Step 2: Delete orphaned tickets (optional - comment out if you want to keep them)
-- DELETE FROM support_tickets 
-- WHERE user_id NOT IN (SELECT id::text FROM users);

-- Step 3: Alter user_id column from VARCHAR to BIGINT to match users.id type
-- First, we need to handle existing data
DO $$
BEGIN
    -- Check if column is already BIGINT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'support_tickets' 
        AND column_name = 'user_id' 
        AND data_type = 'character varying'
    ) THEN
        -- Convert VARCHAR to BIGINT
        -- This will fail if there are non-numeric values
        ALTER TABLE support_tickets 
        ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;
        
        RAISE NOTICE 'Column user_id converted from VARCHAR to BIGINT';
    ELSE
        RAISE NOTICE 'Column user_id is already BIGINT or does not exist';
    END IF;
END $$;

-- Step 4: Add foreign key constraint
DO $$
BEGIN
    -- Check if foreign key already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_support_tickets_user' 
        AND table_name = 'support_tickets'
    ) THEN
        ALTER TABLE support_tickets
        ADD CONSTRAINT fk_support_tickets_user
        FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint fk_support_tickets_user created';
    ELSE
        RAISE NOTICE 'Foreign key constraint fk_support_tickets_user already exists';
    END IF;
END $$;

-- Step 5: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);

-- Step 6: Verify the constraint
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_support_tickets_user'
    AND table_name = 'support_tickets';
    
    IF constraint_count > 0 THEN
        RAISE NOTICE 'SUCCESS: Foreign key constraint is active';
    ELSE
        RAISE WARNING 'WARNING: Foreign key constraint was not created';
    END IF;
END $$;
