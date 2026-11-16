# Pharmacy Management System - REST API Specification

**Base URL:** `http://localhost:8080/api`  
**Content-Type:** `application/json`

---

## 1. Categories Endpoint (`/api/categories`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Retrieve all medicine categories | `200 OK` |
| `GET` | `/api/categories/{id}` | Retrieve specific category by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/categories` | Create a new category | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/categories/{id}` | Update category details | `200 OK` / `400 Bad Request` |
| `DELETE` | `/api/categories/{id}` | Delete category | `200 OK` / `400 Bad Request` |

### Sample Payload (POST /api/categories):
```json
{
  "categoryName": "Cardiovascular",
  "description": "Drugs affecting heart and blood vessel functions"
}
```

---

## 2. Medicines Endpoint (`/api/medicines`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/medicines` | Get all medicines (filters: `?search=`, `?categoryId=`) | `200 OK` |
| `GET` | `/api/medicines/{id}` | Get medicine by ID | `200 OK` / `404 Not Found` |
| `GET` | `/api/medicines/low-stock` | Get low stock medicines (`quantity <= min_stock_level`) | `200 OK` |
| `GET` | `/api/medicines/expired` | Get expired medicines (`expiry_date < CURRENT_DATE`) | `200 OK` |
| `GET` | `/api/medicines/near-expiry` | Get near expiry medicines (within 30 days) | `200 OK` |
| `POST` | `/api/medicines` | Add new medicine | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/medicines/{id}` | Update medicine details | `200 OK` / `400 Bad Request` |
| `DELETE` | `/api/medicines/{id}` | Delete medicine | `200 OK` / `400 Bad Request` |

### Sample Payload (POST /api/medicines):
```json
{
  "medicineName": "Amoxicillin 500mg",
  "categoryId": 1,
  "manufacturer": "Cipla Healthcare",
  "batchNumber": "AMX-2024-01",
  "purchasePrice": 45.00,
  "sellingPrice": 65.00,
  "quantity": 120,
  "minStockLevel": 15,
  "expiryDate": "2027-10-31"
}
```

---

## 3. Suppliers Endpoint (`/api/suppliers`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/suppliers` | List all suppliers (filter: `?search=`) | `200 OK` |
| `GET` | `/api/suppliers/{id}` | Get supplier by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/suppliers` | Register new supplier | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/suppliers/{id}` | Update supplier | `200 OK` / `400 Bad Request` |
| `DELETE` | `/api/suppliers/{id}` | Delete supplier | `200 OK` / `400 Bad Request` |

---

## 4. Customers Endpoint (`/api/customers`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers` | List all customers (filter: `?search=`) | `200 OK` |
| `GET` | `/api/customers/{id}` | Get customer by ID | `200 OK` / `404 Not Found` |
| `GET` | `/api/customers/{id}/purchases` | Get all past invoices for customer | `200 OK` |
| `POST` | `/api/customers` | Register customer | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/customers/{id}` | Update customer | `200 OK` / `400 Bad Request` |
| `DELETE` | `/api/customers/{id}` | Delete customer | `200 OK` / `400 Bad Request` |

---

## 5. Purchases Endpoint (`/api/purchases`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/purchases` | List past purchase orders | `200 OK` |
| `GET` | `/api/purchases/{id}` | Get purchase order with line items | `200 OK` / `404 Not Found` |
| `POST` | `/api/purchases` | Create purchase (triggers stock increase) | `201 Created` / `400 Bad Request` |

### Sample Payload (POST /api/purchases):
```json
{
  "supplierId": 1,
  "notes": "Bulk restocking of antibiotics",
  "items": [
    {
      "medicineId": 1,
      "quantity": 50,
      "unitPrice": 45.00
    }
  ]
}
```

---

## 6. Sales Endpoint (`/api/sales`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sales` | List past sales receipts | `200 OK` |
| `GET` | `/api/sales/{id}` | Get sales invoice details | `200 OK` / `404 Not Found` |
| `POST` | `/api/sales` | Complete sale (triggers stock decrease) | `201 Created` / `400 Bad Request` |

### Sample Payload (POST /api/sales):
```json
{
  "customerId": 1,
  "discountAmount": 10.00,
  "paymentMethod": "UPI",
  "items": [
    {
      "medicineId": 1,
      "quantity": 2,
      "unitPrice": 65.00
    }
  ]
}
```

---

## 7. Reports & Analytics Endpoint (`/api/reports`)

| Method | Endpoint | Underlying DB Mechanism | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/dashboard` | Aggregated Repository Counts & Sums | `200 OK` |
| `GET` | `/api/reports/monthly?year=2026` | PL/pgSQL Function: `get_monthly_sales_report(year)` | `200 OK` |
| `GET` | `/api/reports/best-sellers?limit=10` | PL/pgSQL Function: `get_best_selling_medicines(limit)` | `200 OK` |
| `GET` | `/api/reports/daily-sales` | PostgreSQL View: `sales_summary` | `200 OK` |
| `GET` | `/api/reports/inventory-summary` | PostgreSQL View: `medicine_inventory_summary` | `200 OK` |
| `GET` | `/api/reports/stock-transactions` | Table: `stock_transactions` (populated by triggers) | `200 OK` |

