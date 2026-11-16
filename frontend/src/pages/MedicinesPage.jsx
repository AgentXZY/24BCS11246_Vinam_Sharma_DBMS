import React, { useEffect, useState } from 'react';
import { MedicineAPI, CategoryAPI } from '../services/api';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, LOW_STOCK, EXPIRED, NEAR_EXPIRY

  const [alert, setAlert] = useState(null); // { type, message }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    medicineName: '',
    categoryId: '',
    manufacturer: '',
    batchNumber: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: 0,
    minStockLevel: 10,
    expiryDate: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchCategories = async () => {
    try {
      const res = await CategoryAPI.getAll();
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      let res;
      if (filterMode === 'LOW_STOCK') {
        res = await MedicineAPI.getLowStock();
      } else if (filterMode === 'EXPIRED') {
        res = await MedicineAPI.getExpired();
      } else if (filterMode === 'NEAR_EXPIRY') {
        res = await MedicineAPI.getNearExpiry();
      } else {
        const params = {};
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (selectedCategory) params.categoryId = selectedCategory;
        res = await MedicineAPI.getAll(params);
      }

      if (res.data?.success) {
        setMedicines(res.data.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load medicines from database' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [searchQuery, selectedCategory, filterMode]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingId(med.medicineId);
    setFormData({
      medicineName: med.medicineName,
      categoryId: med.categoryId,
      manufacturer: med.manufacturer,
      batchNumber: med.batchNumber,
      purchasePrice: med.purchasePrice,
      sellingPrice: med.sellingPrice,
      quantity: med.quantity,
      minStockLevel: med.minStockLevel,
      expiryDate: med.expiryDate,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        quantity: parseInt(formData.quantity) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 10,
        categoryId: parseInt(formData.categoryId),
      };

      if (editingId) {
        await MedicineAPI.update(editingId, payload);
        setAlert({ type: 'success', message: 'Medicine updated successfully in PostgreSQL' });
      } else {
        await MedicineAPI.create(payload);
        setAlert({ type: 'success', message: 'Medicine added successfully to PostgreSQL' });
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      setAlert({ type: 'error', message: msg });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'?`)) return;
    try {
      await MedicineAPI.delete(id);
      setAlert({ type: 'success', message: `Medicine '${name}' deleted successfully` });
      fetchMedicines();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not delete medicine';
      setAlert({ type: 'error', message: msg });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Medicine Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage pharmaceutical items, batch numbers, pricing and expiration</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Medicine
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by medicine name, manufacturer or batch..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFilterMode('ALL');
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setFilterMode('ALL');
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchMedicines}
            className="p-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Views:</span>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              filterMode === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Medicines
          </button>
          <button
            onClick={() => setFilterMode('LOW_STOCK')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center ${
              filterMode === 'LOW_STOCK'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Low Stock
          </button>
          <button
            onClick={() => setFilterMode('EXPIRED')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center ${
              filterMode === 'EXPIRED'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <Clock className="w-3 h-3 mr-1" />
            Expired
          </button>
          <button
            onClick={() => setFilterMode('NEAR_EXPIRY')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center ${
              filterMode === 'NEAR_EXPIRY'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <Clock className="w-3 h-3 mr-1" />
            Near Expiry (&le;30 days)
          </button>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : medicines.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No medicines found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Medicine Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Batch</th>
                  <th className="py-3 px-4 font-semibold">Manufacturer</th>
                  <th className="py-3 px-4 font-semibold text-right">Purchase (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Selling (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Stock</th>
                  <th className="py-3 px-4 font-semibold">Expiry Date</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((med) => {
                  const isExpired = med.expired;
                  const isLow = med.lowStock;

                  return (
                    <tr key={med.medicineId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{med.medicineId}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{med.medicineName}</td>
                      <td className="py-3 px-4 text-slate-600">{med.categoryName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{med.batchNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{med.manufacturer}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">₹{med.purchasePrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">₹{med.sellingPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            med.quantity === 0
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {med.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            isExpired
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : 'text-slate-700'
                          }`}
                        >
                          {med.expiryDate}
                          {isExpired && ' (EXPIRED)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(med)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(med.medicineId, med.medicineName)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Medicine Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Medicine' : 'Add New Medicine'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Medicine Name *</label>
              <input
                type="text"
                required
                value={formData.medicineName}
                onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. Amoxicillin 500mg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Manufacturer *</label>
              <input
                type="text"
                required
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. Cipla Healthcare"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Batch Number *</label>
              <input
                type="text"
                required
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. CIP-2024-99"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Purchase Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Initial Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                disabled={!!editingId}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={`w-full px-3 py-2 text-xs border border-slate-300 rounded-md ${
                  editingId ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                }`}
              />
              {editingId && (
                <p className="text-[10px] text-slate-400 mt-0.5">Use Purchases/Sales for authoritative stock changes.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Min Stock Alert Level</label>
              <input
                type="number"
                min="0"
                required
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-sm"
            >
              {editingId ? 'Update Medicine' : 'Save Medicine'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

