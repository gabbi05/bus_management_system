-- ============================================================
-- Bus Management System - MySQL Schema + Seed Data
-- Run: mysql -u root -p < schema.sql
-- ============================================================

DROP DATABASE IF EXISTS bus_management;
CREATE DATABASE bus_management;
USE bus_management;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_number VARCHAR(50) NOT NULL UNIQUE,
  bus_type ENUM('AC', 'Non-AC') NOT NULL,
  capacity INT NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bus_routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_name VARCHAR(150) NOT NULL,
  source VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  stops TEXT,
  departure_time TIME,
  arrival_time TIME,
  bus_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL
);

CREATE TABLE drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  bus_id INT,
  status ENUM('Available', 'On-duty') DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL
);

CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id INT,
  bus_id INT,
  driver_id INT,
  trip_date DATE NOT NULL,
  departure_time TIME,
  arrival_time TIME,
  status ENUM('Upcoming', 'In-Progress', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES bus_routes(id) ON DELETE SET NULL,
  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  passenger_name VARCHAR(100) NOT NULL,
  passenger_phone VARCHAR(20) NOT NULL,
  route_id INT,
  trip_id INT,
  seats INT NOT NULL DEFAULT 1,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  travel_date DATE NOT NULL,
  status ENUM('Confirmed', 'Cancelled') DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES bus_routes(id) ON DELETE SET NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

CREATE TABLE fares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id INT UNIQUE,
  fare_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES bus_routes(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_method ENUM('Cash', 'Online') DEFAULT 'Cash',
  status ENUM('Paid', 'Pending', 'Refunded') DEFAULT 'Paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: admin123)
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');

-- Buses
INSERT INTO buses (bus_number, bus_type, capacity, status) VALUES
('MH-01-AB-1234', 'AC', 45, 'Active'),
('MH-02-CD-5678', 'Non-AC', 52, 'Active'),
('MH-03-EF-9012', 'AC', 40, 'Active'),
('MH-04-GH-3456', 'Non-AC', 50, 'Inactive'),
('MH-05-IJ-7890', 'AC', 36, 'Active');

-- Routes
INSERT INTO bus_routes (route_name, source, destination, stops, departure_time, arrival_time, bus_id) VALUES
('Mumbai - Pune Express', 'Mumbai', 'Pune', 'Khopoli, Lonavala, Talegaon', '06:00:00', '10:00:00', 1),
('Pune - Nashik Highway', 'Pune', 'Nashik', 'Shirdi, Kopargaon', '07:30:00', '12:00:00', 2),
('Mumbai - Nashik Deluxe', 'Mumbai', 'Nashik', 'Thane, Bhiwandi, Igatpuri', '08:00:00', '13:30:00', 3),
('Pune - Aurangabad Express', 'Pune', 'Aurangabad', 'Ahmednagar, Shrirampur', '09:00:00', '14:00:00', 2),
('Mumbai - Kolhapur Overnight', 'Mumbai', 'Kolhapur', 'Pune, Satara, Sangli', '22:00:00', '06:00:00', 5);

-- Drivers
INSERT INTO drivers (name, license_number, phone, bus_id, status) VALUES
('Rajesh Kumar', 'MH-DL-001234', '9876543210', 1, 'On-duty'),
('Suresh Patil', 'MH-DL-005678', '9876543211', 2, 'On-duty'),
('Anil Sharma', 'MH-DL-009012', '9876543212', 3, 'On-duty'),
('Vikram Singh', 'MH-DL-003456', '9876543213', NULL, 'Available'),
('Deepak Yadav', 'MH-DL-007890', '9876543214', 5, 'On-duty');

-- Trips
INSERT INTO trips (route_id, bus_id, driver_id, trip_date, departure_time, arrival_time, status) VALUES
(1, 1, 1, CURDATE(), '06:00:00', '10:00:00', 'In-Progress'),
(2, 2, 2, CURDATE(), '07:30:00', '12:00:00', 'Upcoming'),
(3, 3, 3, CURDATE(), '08:00:00', '13:30:00', 'Upcoming'),
(1, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '06:00:00', '10:00:00', 'Completed'),
(4, 2, 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '09:00:00', '14:00:00', 'Completed');

-- Bookings
INSERT INTO bookings (passenger_name, passenger_phone, route_id, trip_id, seats, booking_date, travel_date, status) VALUES
('Amit Desai', '9811111111', 1, 1, 2, NOW(), CURDATE(), 'Confirmed'),
('Priya Mehta', '9822222222', 1, 1, 1, NOW(), CURDATE(), 'Confirmed'),
('Sanjay Joshi', '9833333333', 2, 2, 3, NOW(), CURDATE(), 'Confirmed'),
('Neha Gupta', '9844444444', 3, 3, 1, NOW(), CURDATE(), 'Confirmed'),
('Ravi Verma', '9855555555', 1, 4, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Confirmed'),
('Sunita Rao', '9866666666', 4, 5, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Confirmed'),
('Kiran Shah', '9877777777', 2, 2, 2, NOW(), CURDATE(), 'Cancelled'),
('Mohan Nair', '9888888888', 1, 1, 1, NOW(), CURDATE(), 'Confirmed'),
('Anita Singh', '9899999999', 3, 3, 2, NOW(), CURDATE(), 'Confirmed'),
('Ramesh Chandra', '9810101010', 4, 5, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Confirmed');

-- Fares
INSERT INTO fares (route_id, fare_amount) VALUES
(1, 350.00),
(2, 280.00),
(3, 420.00),
(4, 310.00),
(5, 550.00);

-- Payments
INSERT INTO payments (booking_id, amount, payment_date, payment_method, status) VALUES
(1, 700.00, NOW(), 'Online', 'Paid'),
(2, 350.00, NOW(), 'Cash', 'Paid'),
(3, 840.00, NOW(), 'Online', 'Paid'),
(4, 420.00, NOW(), 'Cash', 'Paid'),
(5, 700.00, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Online', 'Paid'),
(6, 310.00, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Cash', 'Paid'),
(7, 560.00, NOW(), 'Online', 'Refunded'),
(8, 350.00, NOW(), 'Cash', 'Paid'),
(9, 840.00, NOW(), 'Online', 'Paid'),
(10, 310.00, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Cash', 'Paid');
