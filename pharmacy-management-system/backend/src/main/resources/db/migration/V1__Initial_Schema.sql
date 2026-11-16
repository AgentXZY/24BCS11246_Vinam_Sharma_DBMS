-- ============================================================================
-- PHARMACY MANAGEMENT SYSTEM - RELATIONAL DATABASE SCHEMA (PostgreSQL)
-- DBMS Academic Project
-- Normalization: Up to 3NF
-- Relational Integrity: PK, FK with constraints, CHECK constraints, Indexes
-- ============================================================================

-- Clean up existing tables if dropping schema
DROP TABLE IF EXISTS stock_transactions CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS purchase_items CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- ----------------------------------------------------------------------------
-- 1. TABLE: admins
-- Represents authorized administrators and pharmacists
-- ----------------------------------------------------------------------------
CREATE TABLE admins (
    admin_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'PHARMACIST', 'MANAGER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. TABLE: categories
-- Therapeutic or drug classifications (e.g., Antibiotics, Analgesics)
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    category_id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. TABLE: suppliers
-- Pharmaceutical vendors and manufacturers distributors
-- ----------------------------------------------------------------------------
CREATE TABLE suppliers (
    supplier_id BIGSERIAL PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. TABLE: customers
-- Pharmacy patients and retail buyers
-- ----------------------------------------------------------------------------
CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. TABLE: medicines
-- Pharmaceutical inventory items with batches, pricing, and expiration dates
-- ----------------------------------------------------------------------------
CREATE TABLE medicines (
    medicine_id BIGSERIAL PRIMARY KEY,
    medicine_name VARCHAR(150) NOT NULL,
    category_id BIGINT NOT NULL,
    manufacturer VARCHAR(150) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    purchase_price NUMERIC(10,2) NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 10,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_medicines_category FOREIGN KEY (category_id) 
        REFERENCES categories(category_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_medicine_batch UNIQUE (medicine_name, batch_number),
    CONSTRAINT chk_purchase_price_positive CHECK (purchase_price >= 0),
    CONSTRAINT chk_selling_price_positive CHECK (selling_price >= 0),
    CONSTRAINT chk_selling_gte_purchase CHECK (selling_price >= purchase_price),
    CONSTRAINT chk_medicine_quantity_non_negative CHECK (quantity >= 0),
    CONSTRAINT chk_min_stock_level_non_negative CHECK (min_stock_level >= 0)
);

-- ----------------------------------------------------------------------------
-- 6. TABLE: purchases
-- Purchase orders / inbound procurement from suppliers
-- ----------------------------------------------------------------------------
CREATE TABLE purchases (
    purchase_id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_purchases_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(supplier_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_purchase_total_non_negative CHECK (total_amount >= 0)
);

-- ----------------------------------------------------------------------------
-- 7. TABLE: purchase_items
-- Itemized line items for each supplier purchase
-- ----------------------------------------------------------------------------
CREATE TABLE purchase_items (
    purchase_item_id BIGSERIAL PRIMARY KEY,
    purchase_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_purchase_items_purchase FOREIGN KEY (purchase_id) 
        REFERENCES purchases(purchase_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_purchase_items_medicine FOREIGN KEY (medicine_id) 
        REFERENCES medicines(medicine_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_purchase_item_qty_positive CHECK (quantity > 0),
    CONSTRAINT chk_purchase_item_price_positive CHECK (unit_price >= 0),
    CONSTRAINT chk_purchase_item_total_positive CHECK (total_price >= 0)
);

-- ----------------------------------------------------------------------------
-- 8. TABLE: sales
-- Outbound sales invoices / customer receipts
-- ----------------------------------------------------------------------------
CREATE TABLE sales (
    sale_id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'CARD', 'UPI', 'CREDIT')),
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'REFUNDED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_sales_total_non_negative CHECK (total_amount >= 0),
    CONSTRAINT chk_sales_discount_non_negative CHECK (discount_amount >= 0),
    CONSTRAINT chk_sales_net_non_negative CHECK (net_amount >= 0)
);

-- ----------------------------------------------------------------------------
-- 9. TABLE: sale_items
-- Itemized line items for each customer billing transaction
-- ----------------------------------------------------------------------------
CREATE TABLE sale_items (
    sale_item_id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) 
        REFERENCES sales(sale_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sale_items_medicine FOREIGN KEY (medicine_id) 
        REFERENCES medicines(medicine_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_sale_item_qty_positive CHECK (quantity > 0),
    CONSTRAINT chk_sale_item_price_positive CHECK (unit_price >= 0),
    CONSTRAINT chk_sale_item_total_positive CHECK (total_price >= 0)
);

-- ----------------------------------------------------------------------------
-- 10. TABLE: stock_transactions
-- Complete audit log of every stock change (Purchase, Sale, Adjustment)
-- ----------------------------------------------------------------------------
CREATE TABLE stock_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN')),
    quantity_changed INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    current_stock INTEGER NOT NULL,
    reference_id BIGINT,
    reference_type VARCHAR(30) CHECK (reference_type IN ('PURCHASE_ORDER', 'SALES_INVOICE', 'MANUAL_ADJUSTMENT')),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    
    -- Constraints
    CONSTRAINT fk_stock_transactions_medicine FOREIGN KEY (medicine_id) 
        REFERENCES medicines(medicine_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_previous_stock_non_negative CHECK (previous_stock >= 0),
    CONSTRAINT chk_current_stock_non_negative CHECK (current_stock >= 0)
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE AND OPTIMIZATION
-- ----------------------------------------------------------------------------
CREATE INDEX idx_medicines_category ON medicines(category_id);
CREATE INDEX idx_medicines_name ON medicines(medicine_name);
CREATE INDEX idx_medicines_expiry ON medicines(expiry_date);
CREATE INDEX idx_medicines_quantity ON medicines(quantity);

CREATE INDEX idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);

CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_medicine ON purchase_items(medicine_id);

CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(sale_date);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_medicine ON sale_items(medicine_id);

CREATE INDEX idx_stock_tx_medicine ON stock_transactions(medicine_id);
CREATE INDEX idx_stock_tx_date ON stock_transactions(transaction_date);
