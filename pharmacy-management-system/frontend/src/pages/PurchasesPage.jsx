import React, { useEffect, useState } from 'react';
import { PurchaseAPI, SupplierAPI, MedicineAPI } from '../services/api';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { Plus, Trash2, Eye, RefreshCw, ShoppingCart, CheckCircle2 } from 'lucide-react';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // New Purchase Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { medicineId: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);

  // View Details Modal State
  const [viewingPurchase, setViewingPurchase] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [purRes, supRes, medRes] = await Promise.all([
        PurchaseAPI.getAll(),
        SupplierAPI.getAll(),
        MedicineAPI.getAll()
      ]);

      if (purRes.data?.success) setPurchases(purRes.data.data);
      if (supRes.data?.success) setSuppliers(supRes.data.data);
      if (medRes.data?.success) setMedicines(medRes.data.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load purchase records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenNewPurchase = () => {
    setSelectedSupplierId('');
    setNotes('');
    setItems([{ medicineId: '', quantity: 10, unitPrice: 0, totalPrice: 0 }]);
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems([...items, { medicineId: '', quantity: 10, unitPrice: 0, totalPrice: 0 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === 'medicineId') {
      item.medicineId = value;
      const med = medicines.find((m) => m.medicineId === parseInt(value));
      if (med) {
        item.unitPrice = med.purchasePrice;
      }
    } else if (field === 'quantity') {
      item.quantity = parseInt(value) || 0;
    } else if (field === 'unitPrice') {
      item.unitPrice = parseFloat(value) || 0;
    }

    item.totalPrice = (item.quantity || 0) * (item.unitPrice || 0);
    updated[index] = item;
    setItems(updated);
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setAlert({ type: 'error', message: 'Please select a supplier' });
      return;
    }

    // Validate rows
    for (const it of items) {
      if (!it.medicineId || it.quantity <= 0 || it.unitPrice < 0) {
        setAlert({ type: 'error', message: 'All items must have a valid medicine, quantity > 0, and non-negative price' });
        return;
      }
    }

    try {
      const payload = {
        supplierId: parseInt(selectedSupplierId),
        notes: notes.trim(),
        items: items.map((it) => ({
          medicineId: parseInt(it.medicineId),
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      };

      await PurchaseAPI.create(payload);
      setAlert({
        type: 'success',
        message: 'Purchase saved successfully! Medicine stock increased automatically via PostgreSQL trigger.',
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Inbound Purchases</h2>
          <p className="text-xs text-slate-500 mt-0.5">Procurement orders and stock-increasing inventory receipts</p>
        </div>
        <button
          onClick={handleOpenNewPurchase}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Purchase
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No purchases found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Invoice Number</th>
                  <th className="py-3 px-4 font-semibold">Supplier</th>
                  <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                  <th className="py-3 px-4 font-semibold text-center">Items</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Amount (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((p) => (
                  <tr key={p.purchaseId} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">{p.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{p.supplierName}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.purchaseDate).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-600">
                      {p.items?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      ₹{p.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setViewingPurchase(p)}
                        className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium inline-flex items-center"
                      >
                        <Eye className="w-3 h-3 mr-1" /> View Items
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Purchase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Supplier Purchase Order"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSavePurchase} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Supplier *</label>
              <select
                required
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.supplierId} value={s.supplierId}>
                    {s.supplierName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Order Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bulk seasonal replenishment"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Line Items Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Procurement Line Items</span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
              </button>
            </div>

            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-medium">Medicine</th>
                    <th className="py-2 px-3 font-medium w-24">Qty</th>
                    <th className="py-2 px-3 font-medium w-28">Unit Price (₹)</th>
                    <th className="py-2 px-3 font-medium w-28 text-right">Total (₹)</th>
                    <th className="py-2 px-3 font-medium w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <select
                          required
                          value={it.medicineId}
                          onChange={(e) => handleItemChange(idx, 'medicineId', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                        >
                          <option value="">-- Choose Medicine --</option>
                          {medicines.map((m) => (
                            <option key={m.medicineId} value={m.medicineId}>
                              {m.medicineName} ({m.batchNumber})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={it.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={it.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-medium text-slate-700">
                        ₹{(it.totalPrice || 0).toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          disabled={items.length <= 1}
                          className={`p-1 rounded ${
                            items.length <= 1 ? 'text-slate-300 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-50'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-xs font-medium text-slate-600">Calculated Purchase Total:</span>
            <span className="text-base font-bold text-slate-800">
              ₹{calculateTotalAmount().toFixed(2)}
            </span>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
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
              Submit &amp; Update Inventory
            </button>
          </div>
        </form>
      </Modal>

      {/* View Purchase Details Modal */}
      <Modal
        isOpen={!!viewingPurchase}
        onClose={() => setViewingPurchase(null)}
        title={`Purchase Order: ${viewingPurchase?.invoiceNumber}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <p><strong className="text-slate-800">Supplier:</strong> {viewingPurchase?.supplierName}</p>
              <p><strong className="text-slate-800">Status:</strong> {viewingPurchase?.status}</p>
            </div>
            <div>
              <p><strong className="text-slate-800">Date:</strong> {viewingPurchase && new Date(viewingPurchase.purchaseDate).toLocaleString()}</p>
              <p><strong className="text-slate-800">Total Billed:</strong> ₹{viewingPurchase?.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-medium">Medicine</th>
                  <th className="py-2 px-3 font-medium">Batch</th>
                  <th className="py-2 px-3 font-medium text-center">Quantity</th>
                  <th className="py-2 px-3 font-medium text-right">Unit Price (₹)</th>
                  <th className="py-2 px-3 font-medium text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewingPurchase?.items?.map((it) => (
                  <tr key={it.purchaseItemId}>
                    <td className="py-2 px-3 font-medium text-slate-800">{it.medicineName}</td>
                    <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{it.batchNumber}</td>
                    <td className="py-2 px-3 text-center">{it.quantity}</td>
                    <td className="py-2 px-3 text-right">₹{it.unitPrice.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">₹{it.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}

