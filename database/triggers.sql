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

