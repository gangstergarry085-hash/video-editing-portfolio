-- Add whatsapp_number column to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50) DEFAULT '';
