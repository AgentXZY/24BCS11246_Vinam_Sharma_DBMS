-- ============================================================================
-- PHARMACY MANAGEMENT SYSTEM - VIEWS (PostgreSQL)
-- DBMS Implementation: Pre-computed and abstraction views for reporting & alerts
-- ============================================================================

-- Drop views if they exist
DROP VIEW IF EXISTS medicine_inventory_summary CASCADE;
DROP VIEW IF EXISTS sales_summary CASCADE;
DROP VIEW IF EXISTS near_expiry_medicines CASCADE;
DROP VIEW IF EXISTS expired_medicines CASCADE;
DROP VIEW IF EXISTS low_stock_medicines CASCADE;

-- ----------------------------------------------------------------------------
-- 1. VIEW: low_stock_medicines
-- Identifies medicines requiring restocking (stock <= min_stock_level)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW low_stock_medicines AS
SELECT 
    m.medicine_id,
    m.medicine_name,
    c.category_name,
    m.manufacturer,
    m.batch_number,
    m.quantity AS current_stock,
    m.min_stock_level,
    (m.min_stock_level - m.quantity) AS deficit,
    m.purchase_price,
    m.selling_price,
    m.expiry_date
FROM medicines m
JOIN categories c ON m.category_id = c.category_id
WHERE m.quantity <= m.min_stock_level
  AND m.expiry_date >= CURRENT_DATE
ORDER BY m.quantity ASC;

-- ----------------------------------------------------------------------------
-- 2. VIEW: expired_medicines
-- Lists medicines that have passed their expiration date
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW expired_medicines AS
SELECT 
    m.medicine_id,
    m.medicine_name,
    c.category_name,
    m.manufacturer,
    m.batch_number,
    m.quantity AS expired_stock,
    m.purchase_price,
    (m.quantity * m.purchase_price) AS financial_loss,
    m.expiry_date,
    (CURRENT_DATE - m.expiry_date) AS days_expired
FROM medicines m
JOIN categories c ON m.category_id = c.category_id
WHERE m.expiry_date < CURRENT_DATE
ORDER BY m.expiry_date ASC;

-- ----------------------------------------------------------------------------
-- 3. VIEW: near_expiry_medicines
-- Flags medicines expiring within the next 30 days for urgent clearance/discounting
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW near_expiry_medicines AS
SELECT 
    m.medicine_id,
    m.medicine_name,
    c.category_name,
    m.batch_number,
    m.quantity,
    m.selling_price,
    m.expiry_date,
    (m.expiry_date - CURRENT_DATE) AS days_remaining
FROM medicines m
JOIN categories c ON m.category_id = c.category_id
WHERE m.expiry_date >= CURRENT_DATE 
  AND m.expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
ORDER BY m.expiry_date ASC;

-- ----------------------------------------------------------------------------
-- 4. VIEW: sales_summary
-- Aggregated daily sales overview with invoice counts and net earnings
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW sales_summary AS
SELECT 
    DATE(s.sale_date) AS sale_date,
    COUNT(s.sale_id) AS total_invoices,
    SUM(s.total_amount) AS gross_sales,
    SUM(s.discount_amount) AS total_discount,
    SUM(s.net_amount) AS net_revenue,
    AVG(s.net_amount) AS average_bill_value
FROM sales s
WHERE s.status = 'COMPLETED'
GROUP BY DATE(s.sale_date)
ORDER BY DATE(s.sale_date) DESC;

-- ----------------------------------------------------------------------------
-- 5. VIEW: medicine_inventory_summary
-- Category-level breakdown of inventory valuation and medicine counts
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW medicine_inventory_summary AS
SELECT 
    c.category_id,
    c.category_name,
    COUNT(m.medicine_id) AS total_medicines,
    COALESCE(SUM(m.quantity), 0) AS total_stock_units,
    COALESCE(SUM(m.quantity * m.purchase_price), 0.00) AS total_inventory_cost,
    COALESCE(SUM(m.quantity * m.selling_price), 0.00) AS total_potential_revenue,
    COALESCE(SUM(m.quantity * (m.selling_price - m.purchase_price)), 0.00) AS projected_profit
FROM categories c
LEFT JOIN medicines m ON c.category_id = m.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_inventory_cost DESC;
