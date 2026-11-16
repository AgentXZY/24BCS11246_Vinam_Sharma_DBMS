# PostgreSQL Database Architecture & DBMS Design Documentation

## 1. Normalization Analysis (Up to 3NF)

### First Normal Form (1NF)
- **Atomic Values**: Each attribute contains only scalar, indivisible values. No repeating groups or comma-separated lists exist (e.g., telephone numbers and items are separated into distinct records or dedicated entities).
- **Primary Keys**: Every relation defines an explicit single-attribute surrogate primary key (`BIGSERIAL`).
- **Unique Records**: Distinct primary keys and uniqueness constraints (`uq_medicine_batch`, `username`, `email`, `invoice_number`) guarantee entity uniqueness.

### Second Normal Form (2NF)
- A relation is in 2NF if it is in 1NF and every non-prime attribute is fully functionally dependent on the entire primary key.
- Because surrogate primary keys (`BIGSERIAL`) are used across all tables, no partial dependencies exist on a composite key.
- Repeated item descriptions (e.g., medicine name, manufacturer, unit price) are not stored directly within `purchases` or `sales`. They are decoupled into normalized line item tables (`purchase_items`, `sale_items`) with foreign key references to `medicines`.

### Third Normal Form (3NF)
- A relation is in 3NF if it is in 2NF and has no transitive dependencies (non-prime attributes depending on other non-prime attributes).
- `medicines` stores `category_id` rather than repeating `category_name` and `description`.
- `purchases` references `supplier_id` rather than duplicating supplier address and phone information.
- `sales` references `customer_id` rather than embedding patient contact details in invoices.

---

## 2. Integrity Constraints & Business Rules

1. **Non-Negative Value Constraints (`CHECK`)**:
   - `medicines.purchase_price >= 0`
   - `medicines.selling_price >= 0`
   - `medicines.selling_price >= medicines.purchase_price` (ensures zero negative gross margins)
   - `medicines.quantity >= 0`
   - `medicines.min_stock_level >= 0`
   - `purchases.total_amount >= 0`
   - `sales.total_amount >= 0`, `sales.discount_amount >= 0`, `sales.net_amount >= 0`
   - `purchase_items.quantity > 0`, `purchase_items.unit_price >= 0`, `purchase_items.total_price >= 0`
   - `sale_items.quantity > 0`, `sale_items.unit_price >= 0`, `sale_items.total_price >= 0`

2. **Uniqueness Constraints (`UNIQUE`)**:
   - `admins.username`, `admins.email`
   - `categories.category_name`
   - `suppliers.email`
   - `medicines.(medicine_name, batch_number)`
   - `purchases.invoice_number`
   - `sales.invoice_number`

3. **Referential Integrity Constraints (`FOREIGN KEY`)**:
   - Foreign key cascading deletes configured on parent-child line item relationships (`purchases -> purchase_items`, `sales -> sale_items`).
   - `ON DELETE RESTRICT` configured on dimensional entities (`categories`, `suppliers`, `medicines`, `customers`) to prevent accidental deletion of referenced records.

---

## 3. Database Automation (Triggers & Stored Procedures)

### A. Triggers

1. **`trg_after_purchase_item_insert`**:
   - **Timing**: `AFTER INSERT ON purchase_items FOR EACH ROW`
   - **Functionality**:
     - Acquires row-level lock on `medicines` row using `FOR UPDATE`.
     - Automatically increments `medicines.quantity = quantity + NEW.quantity`.
     - Updates `medicines.purchase_price = NEW.unit_price`.
     - Inserts an immutable audit record into `stock_transactions` (`type = 'PURCHASE'`).
     - Recalculates parent `purchases.total_amount`.

2. **`trg_before_sale_item_insert`**:
   - **Timing**: `BEFORE INSERT ON sale_items FOR EACH ROW`
   - **Functionality**:
     - Locks the target medicine row via `FOR UPDATE` to prevent concurrent race conditions.
     - Enforces expiry validation: if `expiry_date < CURRENT_DATE`, aborts transaction with `RAISE EXCEPTION`.
     - Enforces inventory availability: if `quantity < NEW.quantity`, aborts transaction with `RAISE EXCEPTION`.
     - Deducts stock: `medicines.quantity = quantity - NEW.quantity`.
     - Records audit trail in `stock_transactions` (`type = 'SALE'`).

3. **`trg_after_sale_item_insert`**:
   - **Timing**: `AFTER INSERT ON sale_items FOR EACH ROW`
   - **Functionality**:
     - Recalculates `sales.total_amount = SUM(sale_items.total_price)`.
     - Recalculates `sales.net_amount = total_amount - discount_amount`.

### B. Views
- `low_stock_medicines`: Filters medicines where `quantity <= min_stock_level AND expiry_date >= CURRENT_DATE`.
- `expired_medicines`: Lists medicines with `expiry_date < CURRENT_DATE` alongside financial loss metrics.
- `near_expiry_medicines`: Flags inventory expiring within 30 days.
- `sales_summary`: Computes daily transaction volume, gross revenue, discounts, net revenue, and average bill value.
- `medicine_inventory_summary`: Aggregates category-level stock counts, asset cost valuation, retail value, and projected profit.

### C. Stored Functions (PL/pgSQL)
- `calculate_total_sales(start_date, end_date)`: Returns total net revenue within date range.
- `get_monthly_sales_report(target_year)`: Returns tabular monthly breakdown of orders, gross revenue, discounts, and net revenue.
- `get_best_selling_medicines(limit_count)`: Ranks top-performing medicines by volume sold and revenue generated.
- `get_category_wise_medicine_report()`: Computes multi-table join summary across categories, inventory, and sales.

