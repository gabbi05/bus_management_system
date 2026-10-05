-- ============================================================
-- Add customer support to the database
-- ============================================================

USE bus_management;

-- Add new columns to users table for customer info
ALTER TABLE users ADD COLUMN email VARCHAR(150) UNIQUE;
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN full_name VARCHAR(150);

-- Update role enum to include 'customer'
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'staff', 'customer') DEFAULT 'customer';

-- Add user_id to bookings table so customers can see their own bookings
ALTER TABLE bookings ADD COLUMN user_id INT;
ALTER TABLE bookings ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
