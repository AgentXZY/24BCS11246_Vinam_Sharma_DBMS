-- ============================================================================
-- PHARMACY MANAGEMENT SYSTEM - TRIGGERS & AUTOMATION (PostgreSQL)
-- PostgreSQL PL/pgSQL
-- Features:
-- 1. Automatic stock increase after purchase_item insert
-- 2. Concurrency-safe stock decrease with row-level locking (FOR UPDATE)
-- 3. Strict expiry checking (prevents selling expired medicines)
-- 4. Negative stock prevention
-- 5. Audit log tracking in stock_transactions table
-- 6. Recalculation of parent purchase and sale totals
-- ============================================================================

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS trg_after_purchase_item_insert ON purchase_items;
DROP TRIGGER IF EXISTS trg_before_sale_item_insert ON sale_items;
DROP TRIGGER IF EXISTS trg_after_sale_item_insert ON sale_items;

DROP FUNCTION IF EXISTS fn_process_purchase_item();
DROP FUNCTION IF EXISTS fn_validate_and_process_sale_item();
DROP FUNCTION IF EXISTS fn_update_sale_totals();

-- ----------------------------------------------------------------------------
-- TRIGGER FUNCTION: fn_process_purchase_item
-- Increases stock and records stock transaction when a purchase item is added
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_process_purchase_item()
RETURNS TRIGGER AS $$
DECLARE
    v_old_stock INTEGER;
    v_new_stock INTEGER;
    v_med_name VARCHAR(150);
BEGIN
    -- Concurrency-safe row-level lock on the medicine
    SELECT medicine_name, quantity 
    INTO v_med_name, v_old_stock 
    FROM medicines 
    WHERE medicine_id = NEW.medicine_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Medicine with ID % does not exist', NEW.medicine_id;
    END IF;

    -- Calculate updated stock
    v_new_stock := v_old_stock + NEW.quantity;

    -- Update medicine stock
    UPDATE medicines 
    SET quantity = v_new_stock,
        purchase_price = NEW.unit_price,
        updated_at = CURRENT_TIMESTAMP
    WHERE medicine_id = NEW.medicine_id;

    -- Record in stock_transactions audit log
    INSERT INTO stock_transactions (
        medicine_id,
        transaction_type,
        quantity_changed,
        previous_stock,
        current_stock,
        reference_id,
        reference_type,
        transaction_date,
        remarks
    ) VALUES (
        NEW.medicine_id,
        'PURCHASE',
        NEW.quantity,
        v_old_stock,
        v_new_stock,
        NEW.purchase_id,
        'PURCHASE_ORDER',
        CURRENT_TIMESTAMP,
        'Procured ' || NEW.quantity || ' units of ' || v_med_name || ' (Purchase #' || NEW.purchase_id || ')'
    );

    -- Update purchase total amount
    UPDATE purchases
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM purchase_items
        WHERE purchase_id = NEW.purchase_id
    )
    WHERE purchase_id = NEW.purchase_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_purchase_item_insert
AFTER INSERT ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION fn_process_purchase_item();

-- ----------------------------------------------------------------------------
-- TRIGGER FUNCTION: fn_validate_and_process_sale_item
-- Validates stock availability & expiry date BEFORE sale item is inserted.
-- Decreases inventory atomically and records in stock_transactions.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_validate_and_process_sale_item()
RETURNS TRIGGER AS $$
DECLARE
    v_old_stock INTEGER;
    v_new_stock INTEGER;
    v_expiry DATE;
    v_med_name VARCHAR(150);
BEGIN
    -- Concurrency-safe row-level lock on the medicine row
    SELECT medicine_name, quantity, expiry_date 
    INTO v_med_name, v_old_stock, v_expiry 
    FROM medicines 
    WHERE medicine_id = NEW.medicine_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Medicine with ID % not found', NEW.medicine_id;
    END IF;

    -- 1. Expiry date check
    IF v_expiry < CURRENT_DATE THEN
        RAISE EXCEPTION 'Cannot sell expired medicine: % (expired on %)', v_med_name, v_expiry;
    END IF;

    -- 2. Stock availability check
    IF v_old_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for medicine %: requested %, available %', 
            v_med_name, NEW.quantity, v_old_stock;
    END IF;

    -- 3. Calculate new stock
    v_new_stock := v_old_stock - NEW.quantity;

    -- Prevent negative inventory
    IF v_new_stock < 0 THEN
        RAISE EXCEPTION 'Sale would result in negative inventory for %', v_med_name;
    END IF;

    -- Deduct stock in medicines table
    UPDATE medicines 
    SET quantity = v_new_stock,
        updated_at = CURRENT_TIMESTAMP
    WHERE medicine_id = NEW.medicine_id;

    -- Insert audit log into stock_transactions
    INSERT INTO stock_transactions (
        medicine_id,
        transaction_type,
        quantity_changed,
        previous_stock,
        current_stock,
        reference_id,
        reference_type,
        transaction_date,
        remarks
    ) VALUES (
        NEW.medicine_id,
        'SALE',
        -NEW.quantity,
        v_old_stock,
        v_new_stock,
        NEW.sale_id,
        'SALES_INVOICE',
        CURRENT_TIMESTAMP,
        'Dispensed ' || NEW.quantity || ' units of ' || v_med_name || ' (Sale #' || NEW.sale_id || ')'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_before_sale_item_insert
BEFORE INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION fn_validate_and_process_sale_item();

-- ----------------------------------------------------------------------------
-- TRIGGER FUNCTION: fn_update_sale_totals
-- Updates parent sale total_amount and net_amount after sale_items insertion
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_sale_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sales
    SET total_amount = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM sale_items
            WHERE sale_id = NEW.sale_id
        ),
        net_amount = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM sale_items
            WHERE sale_id = NEW.sale_id
        ) - discount_amount
    WHERE sale_id = NEW.sale_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_sale_item_insert
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION fn_update_sale_totals();


-- ============================================================================
-- PHARMACY MANAGEMENT SYSTEM - STORED FUNCTIONS & PROCEDURES (PostgreSQL)
-- PostgreSQL PL/pgSQL
-- Demonstrates: Stored functions, table returns, aggregation, date manipulation
-- ============================================================================

DROP FUNCTION IF EXISTS calculate_total_sales(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS get_monthly_sales_report(INTEGER);
DROP FUNCTION IF EXISTS get_category_wise_medicine_report();
DROP FUNCTION IF EXISTS get_best_selling_medicines(INTEGER);

-- ----------------------------------------------------------------------------
-- 1. FUNCTION: calculate_total_sales
-- Computes the net sales revenue between two timestamps
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_total_sales(
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS NUMERIC AS $$
DECLARE
    v_total NUMERIC(10,2);
BEGIN
    SELECT COALESCE(SUM(net_amount), 0.00)
    INTO v_total
    FROM sales
    WHERE status = 'COMPLETED'
      AND sale_date BETWEEN p_start_date AND p_end_date;

    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. FUNCTION: get_monthly_sales_report
-- Generates a monthly financial sales report for a specified year
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_monthly_sales_report(p_year INTEGER)
RETURNS TABLE (
    month_number INTEGER,
    month_name TEXT,
    total_orders BIGINT,
    gross_sales NUMERIC,
    total_discount NUMERIC,
    net_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (EXTRACT(MONTH FROM s.sale_date))::INTEGER AS month_number,
        TO_CHAR(s.sale_date, 'Month') AS month_name,
        COUNT(s.sale_id) AS total_orders,
        COALESCE(SUM(s.total_amount), 0.00) AS gross_sales,
        COALESCE(SUM(s.discount_amount), 0.00) AS total_discount,
        COALESCE(SUM(s.net_amount), 0.00) AS net_revenue
    FROM sales s
    WHERE EXTRACT(YEAR FROM s.sale_date) = p_year
      AND s.status = 'COMPLETED'
    GROUP BY EXTRACT(MONTH FROM s.sale_date), TO_CHAR(s.sale_date, 'Month')
    ORDER BY month_number ASC;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. FUNCTION: get_category_wise_medicine_report
-- Aggregates inventory and sales metrics per medicine category
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_category_wise_medicine_report()
RETURNS TABLE (
    category_id BIGINT,
    category_name VARCHAR,
    medicine_count BIGINT,
    total_stock BIGINT,
    inventory_valuation NUMERIC,
    units_sold BIGINT,
    sales_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.category_id,
        c.category_name,
        COUNT(DISTINCT m.medicine_id) AS medicine_count,
        COALESCE(SUM(m.quantity), 0) AS total_stock,
        COALESCE(SUM(m.quantity * m.purchase_price), 0.00) AS inventory_valuation,
        COALESCE(SUM(si.quantity), 0) AS units_sold,
        COALESCE(SUM(si.total_price), 0.00) AS sales_revenue
    FROM categories c
    LEFT JOIN medicines m ON c.category_id = m.category_id
    LEFT JOIN sale_items si ON m.medicine_id = si.medicine_id
    GROUP BY c.category_id, c.category_name
    ORDER BY sales_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. FUNCTION: get_best_selling_medicines
-- Identifies top-performing medicines by quantity and sales volume
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_best_selling_medicines(p_limit INTEGER)
RETURNS TABLE (
    medicine_id BIGINT,
    medicine_name VARCHAR,
    category_name VARCHAR,
    total_quantity_sold BIGINT,
    total_revenue_generated NUMERIC,
    transactions_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.medicine_id,
        m.medicine_name,
        c.category_name,
        COALESCE(SUM(si.quantity), 0) AS total_quantity_sold,
        COALESCE(SUM(si.total_price), 0.00) AS total_revenue_generated,
        COUNT(si.sale_item_id) AS transactions_count
    FROM medicines m
    JOIN categories c ON m.category_id = c.category_id
    JOIN sale_items si ON m.medicine_id = si.medicine_id
    JOIN sales s ON si.sale_id = s.sale_id
    WHERE s.status = 'COMPLETED'
    GROUP BY m.medicine_id, m.medicine_name, c.category_name
    ORDER BY total_quantity_sold DESC, total_revenue_generated DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

