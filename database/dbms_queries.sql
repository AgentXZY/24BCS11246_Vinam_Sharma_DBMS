-- ============================================================================
-- PHARMACY MANAGEMENT SYSTEM - 30+ COMPREHENSIVE DBMS SQL QUERIES
-- Academic Demonstration of Relational Concepts:
-- 1. Basic DQL (SELECT, WHERE, ORDER BY, DISTINCT)
-- 2. Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)
-- 3. Grouping (GROUP BY, HAVING)
-- 4. Joins (INNER, LEFT, RIGHT, FULL OUTER, Multi-Table)
-- 5. Subqueries & Nested Queries
-- 6. Correlated Subqueries & Exists/Not Exists
-- 7. Set Operations (UNION, UNION ALL, INTERSECT, EXCEPT)
-- 8. Date and String Manipulation Functions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: BASIC SELECTION, FILTERING, & SORTING
-- ----------------------------------------------------------------------------

-- Query 1: Basic SELECT with WHERE condition and ORDER BY
-- Retrieve all medicines manufactured by 'Cipla' or 'Sun Pharma' sorted by selling price descending
SELECT medicine_id, medicine_name, manufacturer, batch_number, selling_price, quantity
FROM medicines
WHERE manufacturer IN ('Cipla Healthcare', 'Sun Pharma')
ORDER BY selling_price DESC;

-- Query 2: Range filtering with BETWEEN and DATE comparisons
-- Find medicines expiring between current date and next 6 months
SELECT medicine_id, medicine_name, batch_number, expiry_date, quantity
FROM medicines
WHERE expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '180 days')
ORDER BY expiry_date ASC;

-- Query 3: Pattern matching using ILIKE
-- Search for any medicine whose name contains 'cillin' or 'mycin' (case-insensitive)
SELECT medicine_id, medicine_name, manufacturer, selling_price
FROM medicines
WHERE medicine_name ILIKE '%cillin%' OR medicine_name ILIKE '%mycin%';

-- Query 4: DISTINCT selection
-- Find distinct manufacturers supplying medicines in our inventory
SELECT DISTINCT manufacturer
FROM medicines
ORDER BY manufacturer;

-- ----------------------------------------------------------------------------
-- SECTION 2: AGGREGATE FUNCTIONS (COUNT, SUM, AVG, MIN, MAX)
-- ----------------------------------------------------------------------------

-- Query 5: Overall inventory valuation and metrics
-- Total medicines, total stock count, average purchase price, min and max selling price
SELECT 
    COUNT(*) AS total_medicine_varieties,
    SUM(quantity) AS total_units_in_stock,
    ROUND(AVG(purchase_price), 2) AS avg_purchase_price,
    ROUND(AVG(selling_price), 2) AS avg_selling_price,
    MIN(selling_price) AS cheapest_medicine_price,
    MAX(selling_price) AS most_expensive_medicine_price
FROM medicines;

-- Query 6: Financial totals across all sales
-- Total gross sales, total discounts given, and net collected revenue
SELECT 
    COUNT(sale_id) AS total_transactions,
    SUM(total_amount) AS total_gross_billed,
    SUM(discount_amount) AS total_discounts_granted,
    SUM(net_amount) AS net_revenue_collected,
    ROUND(AVG(net_amount), 2) AS average_order_value
FROM sales
WHERE status = 'COMPLETED';

-- ----------------------------------------------------------------------------
-- SECTION 3: GROUP BY AND HAVING CLAUSES
-- ----------------------------------------------------------------------------

-- Query 7: Category-wise medicine count and stock totals
-- Group medicines by category and calculate total stock per category
SELECT 
    c.category_name,
    COUNT(m.medicine_id) AS medicine_count,
    SUM(m.quantity) AS total_quantity,
    ROUND(AVG(m.selling_price), 2) AS avg_price
FROM categories c
JOIN medicines m ON c.category_id = m.category_id
GROUP BY c.category_name
ORDER BY medicine_count DESC;

-- Query 8: GROUP BY with HAVING filter
-- Find categories that have more than 3 distinct medicines and total stock > 100 units
SELECT 
    c.category_name,
    COUNT(m.medicine_id) AS product_count,
    SUM(m.quantity) AS total_stock
FROM categories c
JOIN medicines m ON c.category_id = m.category_id
GROUP BY c.category_name
HAVING COUNT(m.medicine_id) >= 3 AND SUM(m.quantity) > 100;

-- Query 9: Supplier-wise procurement spend with HAVING threshold
-- Identify suppliers from whom we purchased more than 2,000 in total goods
SELECT 
    s.supplier_name,
    COUNT(p.purchase_id) AS orders_placed,
    SUM(p.total_amount) AS total_spend
FROM suppliers s
JOIN purchases p ON s.supplier_id = p.supplier_id
GROUP BY s.supplier_name
HAVING SUM(p.total_amount) > 2000.00
ORDER BY total_spend DESC;

-- Query 10: Customer billing aggregation with HAVING
-- Find high-value customers who spent more than 200 in total purchases
SELECT 
    c.customer_id,
    c.customer_name,
    c.phone,
    COUNT(s.sale_id) AS visit_count,
    SUM(s.net_amount) AS total_spent
FROM customers c
JOIN sales s ON c.customer_id = s.customer_id
WHERE s.status = 'COMPLETED'
GROUP BY c.customer_id, c.customer_name, c.phone
HAVING SUM(s.net_amount) > 200.00
ORDER BY total_spent DESC;

-- ----------------------------------------------------------------------------
-- SECTION 4: RELATIONAL JOINS (INNER, LEFT, RIGHT, FULL OUTER, MULTI-TABLE)
-- ----------------------------------------------------------------------------

-- Query 11: INNER JOIN
-- Retrieve medicine details along with their category name and supplier who provided it
SELECT 
    m.medicine_name,
    c.category_name,
    m.batch_number,
    m.quantity,
    m.selling_price
FROM medicines m
INNER JOIN categories c ON m.category_id = c.category_id;

-- Query 12: LEFT OUTER JOIN
-- List all categories and their medicines, including categories that might have no medicines
SELECT 
    c.category_id,
    c.category_name,
    COUNT(m.medicine_id) AS total_products
FROM categories c
LEFT JOIN medicines m ON c.category_id = m.category_id
GROUP BY c.category_id, c.category_name
ORDER BY c.category_id;

-- Query 13: LEFT JOIN to find suppliers with zero purchases
-- Identify newly registered suppliers from whom no purchases have been made yet
SELECT 
    s.supplier_id,
    s.supplier_name,
    s.phone,
    s.email
FROM suppliers s
LEFT JOIN purchases p ON s.supplier_id = p.supplier_id
WHERE p.purchase_id IS NULL;

-- Query 14: RIGHT OUTER JOIN
-- View all purchases and matching supplier information
SELECT 
    s.supplier_name,
    p.invoice_number,
    p.purchase_date,
    p.total_amount
FROM suppliers s
RIGHT JOIN purchases p ON s.supplier_id = p.supplier_id;

-- Query 15: FULL OUTER JOIN
-- Compare customers and sales to find customers with no orders as well as sales
SELECT 
    c.customer_name,
    c.phone,
    s.invoice_number,
    s.net_amount
FROM customers c
FULL OUTER JOIN sales s ON c.customer_id = s.customer_id;

-- Query 16: Multi-table JOIN (5 Tables)
-- Complete itemized sales invoice breakdown: customer, invoice, items, medicine, category
SELECT 
    s.invoice_number,
    s.sale_date,
    cust.customer_name,
    cust.phone,
    m.medicine_name,
    cat.category_name,
    si.quantity,
    si.unit_price,
    si.total_price
FROM sales s
JOIN customers cust ON s.customer_id = cust.customer_id
JOIN sale_items si ON s.sale_id = si.sale_id
JOIN medicines m ON si.medicine_id = m.medicine_id
JOIN categories cat ON m.category_id = cat.category_id
ORDER BY s.sale_date DESC, s.invoice_number;

-- ----------------------------------------------------------------------------
-- SECTION 5: SUBQUERIES AND NESTED QUERIES
-- ----------------------------------------------------------------------------

-- Query 17: Single-row subquery in WHERE
-- Find all medicines with a selling price greater than the overall average selling price
SELECT medicine_id, medicine_name, selling_price, 
       (SELECT ROUND(AVG(selling_price), 2) FROM medicines) AS average_market_price
FROM medicines
WHERE selling_price > (SELECT AVG(selling_price) FROM medicines)
ORDER BY selling_price DESC;

-- Query 18: Multi-row subquery with IN
-- Find all customers who purchased medicines in the 'Antibiotics' category
SELECT customer_id, customer_name, phone
FROM customers
WHERE customer_id IN (
    SELECT s.customer_id
    FROM sales s
    JOIN sale_items si ON s.sale_id = si.sale_id
    JOIN medicines m ON si.medicine_id = m.medicine_id
    JOIN categories c ON m.category_id = c.category_id
    WHERE c.category_name = 'Antibiotics'
);

-- Query 19: Multi-row subquery with NOT IN
-- Find medicines that have NEVER been sold in any customer transaction
SELECT medicine_id, medicine_name, category_id, quantity, selling_price
FROM medicines
WHERE medicine_id NOT IN (
    SELECT DISTINCT medicine_id FROM sale_items
);

-- Query 20: Subquery in FROM clause (Derived Table)
-- Calculate profit margin distribution per category using a derived table
SELECT 
    category_summary.category_name,
    category_summary.avg_margin,
    category_summary.total_inventory_value
FROM (
    SELECT 
        c.category_name,
        ROUND(AVG(m.selling_price - m.purchase_price), 2) AS avg_margin,
        SUM(m.quantity * m.purchase_price) AS total_inventory_value
    FROM categories c
    JOIN medicines m ON c.category_id = m.category_id
    GROUP BY c.category_name
) AS category_summary
WHERE category_summary.avg_margin > 25.00
ORDER BY category_summary.avg_margin DESC;

-- ----------------------------------------------------------------------------
-- SECTION 6: CORRELATED SUBQUERIES & EXISTS / NOT EXISTS
-- ----------------------------------------------------------------------------

-- Query 21: Correlated subquery to find the most expensive medicine in each category
SELECT m1.category_id, c.category_name, m1.medicine_name, m1.selling_price
FROM medicines m1
JOIN categories c ON m1.category_id = c.category_id
WHERE m1.selling_price = (
    SELECT MAX(m2.selling_price)
    FROM medicines m2
    WHERE m2.category_id = m1.category_id
)
ORDER BY m1.selling_price DESC;

-- Query 22: Correlated subquery with EXISTS
-- Find customers who made at least one purchase exceeding 200.00 in a single invoice
SELECT c.customer_id, c.customer_name, c.email
FROM customers c
WHERE EXISTS (
    SELECT 1 
    FROM sales s 
    WHERE s.customer_id = c.customer_id 
      AND s.net_amount >= 200.00
);

-- Query 23: Correlated subquery with NOT EXISTS
-- Find suppliers from whom we have NOT made any purchase in the last 20 days
SELECT s.supplier_id, s.supplier_name, s.phone
FROM suppliers s
WHERE NOT EXISTS (
    SELECT 1 
    FROM purchases p 
    WHERE p.supplier_id = s.supplier_id 
      AND p.purchase_date >= (CURRENT_TIMESTAMP - INTERVAL '20 days')
);

-- Query 24: Customer spending relative to overall average customer spend
-- Identify customers whose cumulative spend is strictly above the average customer spend
SELECT 
    c.customer_name,
    SUM(s.net_amount) AS customer_total_spend
FROM customers c
JOIN sales s ON c.customer_id = s.customer_id
GROUP BY c.customer_id, c.customer_name
HAVING SUM(s.net_amount) > (
    SELECT AVG(total_spend_per_cust)
    FROM (
        SELECT SUM(net_amount) AS total_spend_per_cust
        FROM sales
        GROUP BY customer_id
    ) AS cust_averages
);

-- ----------------------------------------------------------------------------
-- SECTION 7: SET OPERATIONS (UNION, UNION ALL, INTERSECT, EXCEPT)
-- ----------------------------------------------------------------------------

-- Query 25: UNION
-- Combine all party contacts (suppliers and customers) into a unified directory
SELECT supplier_name AS contact_name, phone, email, 'SUPPLIER' AS party_type
FROM suppliers
UNION
SELECT customer_name AS contact_name, phone, COALESCE(email, 'N/A'), 'CUSTOMER' AS party_type
FROM customers
ORDER BY contact_name;

-- Query 26: UNION ALL with Activity Logging
-- Audit feed combining recent purchases and sales events
SELECT 
    'PURCHASE' AS transaction_kind,
    p.invoice_number AS ref_code,
    s.supplier_name AS counterparty,
    p.total_amount AS amount,
    p.purchase_date AS event_time
FROM purchases p
JOIN suppliers s ON p.supplier_id = s.supplier_id
UNION ALL
SELECT 
    'SALE' AS transaction_kind,
    sl.invoice_number AS ref_code,
    c.customer_name AS counterparty,
    sl.net_amount AS amount,
    sl.sale_date AS event_time
FROM sales sl
JOIN customers c ON sl.customer_id = c.customer_id
ORDER BY event_time DESC;

-- Query 27: EXCEPT
-- Find medicines that are in stock but have never been sold to any customer
SELECT medicine_id, medicine_name FROM medicines WHERE quantity > 0
EXCEPT
SELECT m.medicine_id, m.medicine_name 
FROM medicines m 
JOIN sale_items si ON m.medicine_id = si.medicine_id;

-- ----------------------------------------------------------------------------
-- SECTION 8: DATE, TIME, & STRING MANIPULATION FUNCTIONS
-- ----------------------------------------------------------------------------

-- Query 28: Date arithmetic and AGE calculation
-- Calculate exact shelf life remaining or expiration lapse for medicines
SELECT 
    medicine_name,
    batch_number,
    expiry_date,
    CURRENT_DATE AS today,
    AGE(expiry_date, CURRENT_DATE) AS shelf_life_remaining,
    CASE 
        WHEN expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'CRITICAL (NEAR EXPIRY)'
        WHEN expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'WARNING (SOON)'
        ELSE 'VALID'
    END AS safety_status
FROM medicines
ORDER BY expiry_date ASC;

-- Query 29: DATE_TRUNC and EXTRACT for Sales Analytics
-- Monthly sales breakdown using date truncation
SELECT 
    DATE_TRUNC('month', sale_date) AS sales_month,
    COUNT(sale_id) AS total_orders,
    SUM(net_amount) AS monthly_revenue,
    ROUND(AVG(net_amount), 2) AS avg_basket_size
FROM sales
GROUP BY DATE_TRUNC('month', sale_date)
ORDER BY sales_month DESC;

-- Query 30: String concatenation and conditional formatting
-- Format custom invoice receipt summaries with customer details
SELECT 
    s.invoice_number,
    CONCAT(c.customer_name, ' (Ph: ', c.phone, ')') AS customer_info,
    TO_CHAR(s.sale_date, 'DD-Mon-YYYY HH12:MI AM') AS formatted_date,
    CONCAT('INR ', TRIM(TO_CHAR(s.net_amount, '999,999.99'))) AS payable_amount,
    s.payment_method
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
ORDER BY s.sale_date DESC;

-- Query 31: Stock movement audit query with window functions
-- Track running balances of inventory across all transactions
SELECT 
    st.transaction_id,
    m.medicine_name,
    st.transaction_type,
    st.quantity_changed,
    st.previous_stock,
    st.current_stock,
    st.transaction_date,
    st.remarks
FROM stock_transactions st
JOIN medicines m ON st.medicine_id = m.medicine_id
ORDER BY st.transaction_date DESC
LIMIT 20;

-- Query 32: Best-selling medicines by revenue and volume
SELECT 
    m.medicine_id,
    m.medicine_name,
    c.category_name,
    SUM(si.quantity) AS total_units_sold,
    SUM(si.total_price) AS total_revenue_generated,
    RANK() OVER (ORDER BY SUM(si.total_price) DESC) AS revenue_rank
FROM sale_items si
JOIN medicines m ON si.medicine_id = m.medicine_id
JOIN categories c ON m.category_id = c.category_id
GROUP BY m.medicine_id, m.medicine_name, c.category_name
ORDER BY revenue_rank ASC;