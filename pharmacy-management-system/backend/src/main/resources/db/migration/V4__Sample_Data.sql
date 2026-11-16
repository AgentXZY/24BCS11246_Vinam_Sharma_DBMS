-- ============================================================================
-- PHARMACY MANAGEMENT SYSTEM - REALISTIC SAMPLE DATA (PostgreSQL)
-- Requirements:
-- >= 5 Categories
-- >= 5 Suppliers
-- >= 10 Customers
-- >= 20 Medicines (Healthy stock, Low-stock, Near-expiry, Expired)
-- Multiple Purchases & Purchase Items
-- Multiple Sales & Sale Items
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Insert Admins
-- ----------------------------------------------------------------------------
INSERT INTO admins (username, password_hash, full_name, email, role) VALUES
('admin', 'admin123', 'System Administrator', 'admin@pharmacy.com', 'ADMIN'),
('pharmacist_raj', 'pharma123', 'Rajesh K. Pharmacist', 'rajesh@pharmacy.com', 'PHARMACIST'),
('manager_meera', 'manager123', 'Meera S. Inventory Manager', 'meera@pharmacy.com', 'MANAGER');

-- ----------------------------------------------------------------------------
-- 2. Insert Categories (6 categories)
-- ----------------------------------------------------------------------------
INSERT INTO categories (category_name, description) VALUES
('Antibiotics', 'Antibacterial medicines used in the treatment and prevention of bacterial infections.'),
('Analgesics & Antipyretics', 'Pain relievers and fever reducing medications.'),
('Cardiovascular', 'Drugs for heart conditions, hypertension, and blood circulation.'),
('Diabetes & Endocrine', 'Oral hypoglycemic agents and hormonal balance medications.'),
('Respiratory & Antiallergic', 'Bronchodilators, antihistamines, and cough relief medicines.'),
('Gastrointestinal', 'Antacids, proton pump inhibitors, and digestive tract medications');

-- ----------------------------------------------------------------------------
-- 3. Insert Suppliers (6 suppliers)
-- ----------------------------------------------------------------------------
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES
('Sun Pharma Distribution', 'Ramesh Shah', '+91 9820011223', 'orders@sunpharma-dist.com', 'Plot 45, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra'),
('Cipla Healthcare Logistics', 'Sunil Deshmukh', '+91 9845033445', 'supply@cipla-logistics.com', 'Cipla House, Peninsula Business Park, Lower Parel, Mumbai, Maharashtra'),
('Lupin Medical Supplies', 'Anand Kulkarni', '+91 9811055667', 'sales@lupin-supplies.com', '159 CST Road, Kalina, Santacruz East, Mumbai, Maharashtra'),
('Torrent Medical Traders', 'Kavita Mehta', '+91 9898077889', 'contact@torrent-medicals.com', 'Torrent House, Off Ashram Road, Ahmedabad, Gujarat'),
('Dr. Reddys Hub', 'Venkatesh Rao', '+91 9988012345', 'logistics@drreddys-hub.com', ' Ameerpet Road, Hyderabad, Telangana'),
('Zydus Cadila Healthcare Agency', 'Pradeep Patel', '+91 9723045678', 'dispatch@zydus-agency.com', 'Sarkhej-Bavla Highway, Changodar, Ahmedabad, Gujarat');

-- ----------------------------------------------------------------------------
-- 4. Insert Customers (12 customers)
-- ----------------------------------------------------------------------------
INSERT INTO customers (customer_name, phone, email, address) VALUES
('Rahul Sharma', '+91 9876543210', 'rahul.sharma@gmail.com', 'Flat 402, Sunshine Heights, MG Road, Pune'),
('Priya Patel', '+91 9823456781', 'priya.patel@yahoo.com', 'B-12, Green Acres Society, Baner, Pune'),
('Amit Verma', '+91 9812345672', 'amit.verma@outlook.com', '14/3, Civil Lines, Shivaji Nagar, Pune'),
('Neha Gupta', '+91 9890123453', 'neha.gupta@gmail.com', 'Row House 5, Lotus Meadows, Viman Nagar, Pune'),
('Rajesh Kumar', '+91 9765432104', 'rajesh.k@rediffmail.com', '210, Shanti Kunj, Kothrud, Pune'),
('Sneha Iyer', '+91 9834567815', 'sneha.iyer@gmail.com', 'Flat 101, Palm Grove, Kalyani Nagar, Pune'),
('Vikram Singh', '+91 9856789026', 'vikram.singh@gmail.com', 'Plot 88, Defense Colony, Camp, Pune'),
('Ananya Joshi', '+91 9822334457', 'ananya.joshi@gmail.com', '78, Ideal Colony, Paud Road, Pune'),
('Suresh Reddy', '+91 9944556678', 'suresh.reddy@gmail.com', '55, Lake View Residency, Hadapsar, Pune'),
('Pooja Desai', '+91 9866778899', 'pooja.desai@gmail.com', 'A-304, Marvel Zephyr, Kharadi, Pune'),
('Deepak Malhotra', '+91 9819283740', 'deepak.m@gmail.com', 'Flat 6, Heritage Palace, Aundh, Pune'),
('Sunita Nair', '+91 9871239870', 'sunita.nair@gmail.com', '102, Green Park Avenue, Wakad, Pune');

-- ----------------------------------------------------------------------------
-- 5. Insert Medicines (24 medicines)
-- Represents:
-- - Category 1 (Antibiotics)
-- - Category 2 (Analgesics & Antipyretics)
-- - Category 3 (Cardiovascular)
-- - Category 4 (Diabetes & Endocrine)
-- - Category 5 (Respiratory & Antiallergic)
-- - Category 6 (Gastrointestinal)
-- Stock Status Varieties:
-- - Healthy Stock (e.g., 50-150 units)
-- - Low Stock (e.g., 3-8 units, min_stock_level=15)
-- - Near Expiry (e.g., Nov/Dec 2026)
-- - Expired (e.g., 2025 or mid 2026)
-- ----------------------------------------------------------------------------
INSERT INTO medicines (medicine_name, category_id, manufacturer, batch_number, purchase_price, selling_price, quantity, min_stock_level, expiry_date) VALUES
-- Category 1: Antibiotics
('Amoxicillin 500mg', 1, 'Cipla Healthcare', 'AMX-2024-01', 45.00, 65.00, 120, 15, '2027-10-31'),
('Azithromycin 500mg', 1, 'Sun Pharma', 'AZI-2024-09', 80.00, 115.00, 85, 20, '2027-12-15'),
('Ciprofloxacin 500mg', 1, 'Dr. Reddys', 'CIP-2024-11', 52.00, 78.00, 60, 15, '2027-08-20'),
('Augmentin 625 Duo', 1, 'GSK Pharma', 'AUG-2024-04', 120.00, 168.00, 4, 15, '2027-06-30'), -- LOW STOCK

-- Category 2: Analgesics & Antipyretics
('Paracetamol 650mg (Dolo)', 2, 'Micro Labs', 'DOL-2024-88', 18.00, 30.00, 250, 30, '2028-02-28'),
('Ibuprofen 400mg', 2, 'Abbott India', 'IBU-2024-12', 22.00, 35.00, 95, 20, '2027-11-20'),
('Combiflam Tablet', 2, 'Sanofi India', 'CMB-2024-33', 28.00, 42.00, 140, 25, '2027-09-15'),
('Tramadol 50mg', 2, 'Torrent Medicals', 'TRM-2023-01', 65.00, 95.00, 5, 10, '2026-11-28'), -- LOW STOCK + NEAR EXPIRY

-- Category 3: Cardiovascular
('Amlodipine 5mg', 3, 'Pfizer India', 'AML-2024-07', 35.00, 55.00, 110, 20, '2028-04-30'),
('Telmisartan 40mg', 3, 'Glenmark', 'TEL-2024-22', 72.00, 105.00, 75, 15, '2027-07-31'),
('Atorvastatin 10mg', 3, 'Zydus Cadila', 'ATV-2024-55', 68.00, 98.00, 90, 20, '2027-12-31'),
('Losartan Potassium 50mg', 3, 'Lupin Pharma', 'LOS-2023-99', 48.00, 70.00, 15, 10, '2025-11-10'), -- EXPIRED

-- Category 4: Diabetes & Endocrine
('Metformin 500mg SR', 4, 'USV Private Ltd', 'MET-2024-10', 25.00, 40.00, 180, 25, '2028-01-31'),
('Glimepiride 2mg', 4, 'Sanofi India', 'GLM-2024-44', 42.00, 64.00, 80, 15, '2027-05-15'),
('Thyronorm 50mcg', 4, 'Abbott India', 'THY-2024-18', 95.00, 135.00, 65, 15, '2027-08-15'),
('Vildagliptin 50mg', 4, 'Novartis India', 'VLD-2023-77', 150.00, 210.00, 3, 10, '2026-12-05'), -- LOW STOCK + NEAR EXPIRY

-- Category 5: Respiratory & Antiallergic
('Cetirizine 10mg', 5, 'Dr. Reddys', 'CET-2024-02', 12.00, 22.00, 160, 20, '2028-03-31'),
('Montelukast + Levocetirizine', 5, 'Sun Pharma', 'MON-2024-19', 85.00, 125.00, 50, 15, '2027-09-30'),
('Ascoril LS Cough Syrup', 5, 'Glenmark', 'ASC-2024-06', 75.00, 110.00, 40, 10, '2027-06-25'),
('Allegra 120mg', 5, 'Sanofi India', 'ALL-2023-14', 110.00, 160.00, 12, 10, '2025-08-15'), -- EXPIRED

-- Category 6: Gastrointestinal
('Pantoprazole 40mg (Pan 40)', 6, 'Alkem Labs', 'PAN-2024-03', 60.00, 92.00, 130, 20, '2027-10-15'),
('Omeprazole 20mg (Omez)', 6, 'Dr. Reddys', 'OMZ-2024-81', 40.00, 62.00, 100, 15, '2027-11-30'),
('Gelusil MPS Antacid Liquid', 6, 'Pfizer India', 'GEL-2024-25', 55.00, 85.00, 45, 10, '2027-04-30'),
('Rabeprazole 20mg', 6, 'Torrent Medicals', 'RAB-2023-09', 58.00, 88.00, 2, 15, '2026-11-25'); -- LOW STOCK + NEAR EXPIRY

-- Record initial inventory in stock_transactions table as baseline stock adjustments
INSERT INTO stock_transactions (medicine_id, transaction_type, quantity_changed, previous_stock, current_stock, reference_id, reference_type, transaction_date, remarks)
SELECT 
    medicine_id, 
    'ADJUSTMENT', 
    quantity, 
    0, 
    quantity, 
    NULL, 
    'MANUAL_ADJUSTMENT', 
    CURRENT_TIMESTAMP - INTERVAL '60 days', 
    'Initial physical inventory count audit'
FROM medicines;

-- ----------------------------------------------------------------------------
-- 6. Insert Historical Purchases
-- (Trigger will update medicine quantities and log stock_transactions)
-- ----------------------------------------------------------------------------
INSERT INTO purchases (invoice_number, supplier_id, purchase_date, total_amount, status, notes) VALUES
('PUR-2026-001', 1, CURRENT_TIMESTAMP - INTERVAL '45 days', 0.00, 'COMPLETED', 'Seasonal procurement of essential antibiotics'),
('PUR-2026-002', 2, CURRENT_TIMESTAMP - INTERVAL '30 days', 0.00, 'COMPLETED', 'Analgesics restocking'),
('PUR-2026-003', 3, CURRENT_TIMESTAMP - INTERVAL '15 days', 0.00, 'COMPLETED', 'Cardio & diabetic formulations bulk purchase'),
('PUR-2026-004', 4, CURRENT_TIMESTAMP - INTERVAL '5 days', 0.00, 'COMPLETED', 'Gastro & respiratory medicines order');

-- Insert line items (trigger fn_process_purchase_item executes automatically!)
INSERT INTO purchase_items (purchase_id, medicine_id, quantity, unit_price, total_price) VALUES
-- Purchase 1
(1, 1, 50, 45.00, 2250.00),
(1, 2, 30, 80.00, 2400.00),
-- Purchase 2
(2, 5, 100, 18.00, 1800.00),
(2, 6, 40, 22.00, 880.00),
(2, 7, 50, 28.00, 1400.00),
-- Purchase 3
(3, 9, 40, 35.00, 1400.00),
(3, 13, 60, 25.00, 1500.00),
(3, 14, 30, 42.00, 1260.00),
-- Purchase 4
(4, 21, 50, 60.00, 3000.00),
(4, 22, 40, 40.00, 1600.00);

-- ----------------------------------------------------------------------------
-- 7. Insert Historical Sales
-- (Trigger fn_validate_and_process_sale_item & fn_update_sale_totals execute automatically!)
-- ----------------------------------------------------------------------------
INSERT INTO sales (invoice_number, customer_id, sale_date, total_amount, discount_amount, net_amount, payment_method, status) VALUES
('INV-2026-101', 1, CURRENT_TIMESTAMP - INTERVAL '20 days', 0.00, 20.00, 0.00, 'UPI', 'COMPLETED'),
('INV-2026-102', 2, CURRENT_TIMESTAMP - INTERVAL '18 days', 0.00, 0.00, 0.00, 'CASH', 'COMPLETED'),
('INV-2026-103', 3, CURRENT_TIMESTAMP - INTERVAL '15 days', 0.00, 15.00, 0.00, 'CARD', 'COMPLETED'),
('INV-2026-104', 4, CURRENT_TIMESTAMP - INTERVAL '10 days', 0.00, 10.00, 0.00, 'UPI', 'COMPLETED'),
('INV-2026-105', 5, CURRENT_TIMESTAMP - INTERVAL '7 days', 0.00, 0.00, 0.00, 'CASH', 'COMPLETED'),
('INV-2026-106', 6, CURRENT_TIMESTAMP - INTERVAL '4 days', 0.00, 50.00, 0.00, 'CARD', 'COMPLETED'),
('INV-2026-107', 7, CURRENT_TIMESTAMP - INTERVAL '2 days', 0.00, 0.00, 0.00, 'UPI', 'COMPLETED'),
('INV-2026-108', 8, CURRENT_TIMESTAMP - INTERVAL '1 days', 0.00, 0.00, 0.00, 'CASH', 'COMPLETED');

-- Insert sale line items for unexpired medicines with stock
INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, total_price) VALUES
-- Sale 1 (Customer: Rahul Sharma)
(1, 1, 2, 65.00, 130.00),
(1, 5, 3, 30.00, 90.00),
-- Sale 2 (Customer: Priya Patel)
(2, 2, 1, 115.00, 115.00),
(2, 21, 2, 92.00, 184.00),
-- Sale 3 (Customer: Amit Verma)
(3, 9, 2, 55.00, 110.00),
(3, 10, 1, 105.00, 105.00),
(3, 5, 4, 30.00, 120.00),
-- Sale 4 (Customer: Neha Gupta)
(4, 13, 3, 40.00, 120.00),
(4, 14, 2, 64.00, 128.00),
-- Sale 5 (Customer: Rajesh Kumar)
(5, 17, 2, 22.00, 44.00),
(5, 18, 1, 125.00, 125.00),
-- Sale 6 (Customer: Sneha Iyer)
(6, 2, 2, 115.00, 230.00),
(6, 21, 3, 92.00, 276.00),
(6, 23, 1, 85.00, 85.00),
-- Sale 7 (Customer: Vikram Singh)
(7, 5, 5, 30.00, 150.00),
(7, 6, 2, 35.00, 70.00),
-- Sale 8 (Customer: Ananya Joshi)
(8, 22, 2, 62.00, 124.00);
