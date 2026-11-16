# Pharmacy Management System - Entity Relationship (ER) Diagram

## 1. Conceptual Model Overview
The **Pharmacy Management System** relational database model is designed up to **Third Normal Form (3NF)**. It ensures complete referential integrity, eliminates update/delete anomalies, enforces ACID compliance, and provides automated inventory synchronization through PostgreSQL triggers.

```mermaid
erDiagram
    CATEGORIES ||--o{ MEDICINES : "classifies"
    SUPPLIERS ||--o{ PURCHASES : "fulfills"
    PURCHASES ||--|{ PURCHASE_ITEMS : "contains"
    MEDICINES ||--o{ PURCHASE_ITEMS : "supplied_in"
    CUSTOMERS ||--o{ SALES : "places"
    SALES ||--|{ SALE_ITEMS : "contains"
    MEDICINES ||--o{ SALE_ITEMS : "dispensed_in"
    MEDICINES ||--o{ STOCK_TRANSACTIONS : "tracked_by"

    ADMINS {
        BIGSERIAL admin_id PK
        VARCHAR username UK
        VARCHAR password_hash
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR role
        TIMESTAMPTZ created_at
    }

    CATEGORIES {
        BIGSERIAL category_id PK
        VARCHAR category_name UK
        TEXT description
        TIMESTAMPTZ created_at
    }

    SUPPLIERS {
        BIGSERIAL supplier_id PK
        VARCHAR supplier_name
        VARCHAR contact_person
        VARCHAR phone
        VARCHAR email UK
        TEXT address
        TIMESTAMPTZ created_at
    }

    CUSTOMERS {
        BIGSERIAL customer_id PK
        VARCHAR customer_name
        VARCHAR phone
        VARCHAR email
        TEXT address
        TIMESTAMPTZ created_at
    }

    MEDICINES {
        BIGSERIAL medicine_id PK
        VARCHAR medicine_name
        BIGINT category_id FK
        VARCHAR manufacturer
        VARCHAR batch_number
        NUMERIC purchase_price
        NUMERIC selling_price
        INTEGER quantity
        INTEGER min_stock_level
        DATE expiry_date
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    PURCHASES {
        BIGSERIAL purchase_id PK
        VARCHAR invoice_number UK
        BIGINT supplier_id FK
        TIMESTAMPTZ purchase_date
        NUMERIC total_amount
        VARCHAR status
        TEXT notes
        TIMESTAMPTZ created_at
    }

    PURCHASE_ITEMS {
        BIGSERIAL purchase_item_id PK
        BIGINT purchase_id FK
        BIGINT medicine_id FK
        INTEGER quantity
        NUMERIC unit_price
        NUMERIC total_price
        TIMESTAMPTZ created_at
    }

    SALES {
        BIGSERIAL sale_id PK
        VARCHAR invoice_number UK
        BIGINT customer_id FK
        TIMESTAMPTZ sale_date
        NUMERIC total_amount
        NUMERIC discount_amount
        NUMERIC net_amount
        VARCHAR payment_method
        VARCHAR status
        TIMESTAMPTZ created_at
    }

    SALE_ITEMS {
        BIGSERIAL sale_item_id PK
        BIGINT sale_id FK
        BIGINT medicine_id FK
        INTEGER quantity
        NUMERIC unit_price
        NUMERIC total_price
        TIMESTAMPTZ created_at
    }

    STOCK_TRANSACTIONS {
        BIGSERIAL transaction_id PK
        BIGINT medicine_id FK
        VARCHAR transaction_type
        INTEGER quantity_changed
        INTEGER previous_stock
        INTEGER current_stock
        BIGINT reference_id
        VARCHAR reference_type
        TIMESTAMPTZ transaction_date
        TEXT remarks
    }
```

---

## 2. Cardinality and Multiplicity Rules

| Parent Entity | Child Entity | Cardinality | Business Meaning |
| :--- | :--- | :--- | :--- |
| `CATEGORIES` | `MEDICINES` | **1 : N** | A category can classify multiple medicines. Each medicine must belong to exactly one category. |
| `SUPPLIERS` | `PURCHASES` | **1 : N** | A supplier can provide zero, one, or many purchase shipments. Each purchase order is fulfilled by one supplier. |
| `PURCHASES` | `PURCHASE_ITEMS`| **1 : N** | A purchase order contains one or more line items. Deleting a purchase cascades to its line items. |
| `MEDICINES` | `PURCHASE_ITEMS`| **1 : N** | A medicine can appear across multiple inbound purchase orders. |
| `CUSTOMERS` | `SALES` | **1 : N** | A customer can make multiple purchases over time. Every sale invoice references one customer. |
| `SALES` | `SALE_ITEMS` | **1 : N** | A sale invoice contains one or more dispensed medicines. Deleting a sale cascades to its line items. |
| `MEDICINES` | `SALE_ITEMS` | **1 : N** | A medicine can be dispensed across many customer invoices. |
| `MEDICINES` | `STOCK_TRANSACTIONS` | **1 : N** | Every quantity modification (purchase, sale, manual adjustment) generates an immutable audit record. |

