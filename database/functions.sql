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

