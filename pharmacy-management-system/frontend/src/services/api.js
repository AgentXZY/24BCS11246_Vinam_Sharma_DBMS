import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const CategoryAPI = {
  getAll: () => apiClient.get('/categories'),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
};

export const MedicineAPI = {
  getAll: (params) => apiClient.get('/medicines', { params }),
  getById: (id) => apiClient.get(`/medicines/${id}`),
  create: (data) => apiClient.post('/medicines', data),
  update: (id, data) => apiClient.put(`/medicines/${id}`, data),
  delete: (id) => apiClient.delete(`/medicines/${id}`),
  getLowStock: () => apiClient.get('/medicines/low-stock'),
  getExpired: () => apiClient.get('/medicines/expired'),
  getNearExpiry: () => apiClient.get('/medicines/near-expiry'),
};

export const SupplierAPI = {
  getAll: (params) => apiClient.get('/suppliers', { params }),
  getById: (id) => apiClient.get(`/suppliers/${id}`),
  create: (data) => apiClient.post('/suppliers', data),
  update: (id, data) => apiClient.put(`/suppliers/${id}`, data),
  delete: (id) => apiClient.delete(`/suppliers/${id}`),
};

export const CustomerAPI = {
  getAll: (params) => apiClient.get('/customers', { params }),
  getById: (id) => apiClient.get(`/customers/${id}`),
  getPurchases: (id) => apiClient.get(`/customers/${id}/purchases`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
};

export const PurchaseAPI = {
  getAll: () => apiClient.get('/purchases'),
  getById: (id) => apiClient.get(`/purchases/${id}`),
  create: (data) => apiClient.post('/purchases', data),
};

export const SaleAPI = {
  getAll: () => apiClient.get('/sales'),
  getById: (id) => apiClient.get(`/sales/${id}`),
  create: (data) => apiClient.post('/sales', data),
};

export const ReportAPI = {
  getDashboard: () => apiClient.get('/reports/dashboard'),
  getMonthly: (year) => apiClient.get('/reports/monthly', { params: { year } }),
  getBestSellers: (limit) => apiClient.get('/reports/best-sellers', { params: { limit } }),
  getDailySales: () => apiClient.get('/reports/daily-sales'),
  getInventorySummary: () => apiClient.get('/reports/inventory-summary'),
  getStockTransactions: () => apiClient.get('/reports/stock-transactions'),
};

export const AdminAPI = {
  login: (credentials) => apiClient.post('/admin/login', credentials),
  getUsers: () => apiClient.get('/admin/users'),
};

export default apiClient;

