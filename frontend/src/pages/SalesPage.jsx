import React, { useEffect, useState } from 'react';
import { SaleAPI, CustomerAPI, MedicineAPI } from '../services/api';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import {
  Plus,
  Trash2,
  Eye,
  Receipt,
  RefreshCw,
  Printer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // New Sale POS State
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [items, setItems] = useState([
    { medicineId: '', quantity: 1, unitPrice: 0, totalPrice: 0, availableStock: 0, isExpired: false }
  ]);

  // Invoice Receipt Modal State
  const [invoiceModal, setInvoiceModal] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, custRes, medRes] = await Promise.all([
        SaleAPI.getAll(),
        CustomerAPI.getAll(),
        MedicineAPI.getAll()
      ]);

      if (salesRes.data?.success) setSales(salesRes.data.data);
      if (custRes.data?.success) setCustomers(custRes.data.data);
      if (medRes.data?.success) setMedicines(medRes.data.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load sales data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenNewSale = () => {
    setSelectedCustomerId('');
    setDiscountAmount(0);
    setPaymentMethod('CASH');
    setItems([{ medicineId: '', quantity: 1, unitPrice: 0, totalPrice: 0, availableStock: 0, isExpired: false }]);
    setIsNewSaleOpen(true);
  };

  const handleAddItemRow = () => {
    setItems([...items, { medicineId: '', quantity: 1, unitPrice: 0, totalPrice: 0, availableStock: 0, isExpired: false }]);
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
        item.unitPrice = med.sellingPrice;
        item.availableStock = med.quantity;
        item.isExpired = med.expired;
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

  const calculateSubtotal = () => {
    return items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
  };

  const calculateNetAmount = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(discountAmount) || 0;
    return Math.max(0, subtotal - discount);
  };

  const handleCompleteSale = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setAlert({ type: 'error', message: 'Please select a customer for the sale' });
      return;
    }

    // Client-side guard rails before dispatching transaction
    for (const it of items) {
      if (!it.medicineId) {
        setAlert({ type: 'error', message: 'Please select a medicine for every row' });
        return;
      }
      if (it.isExpired) {
        setAlert({ type: 'error', message: 'Cannot sell expired medicine. PostgreSQL trigger will reject this.' });
        return;
      }
      if (it.quantity > it.availableStock) {
        setAlert({
          type: 'error',
          message: `Requested quantity (${it.quantity}) exceeds available stock (${it.availableStock})`,
        });
        return;
      }
    }

    try {
      const payload = {
        customerId: parseInt(selectedCustomerId),
        discountAmount: parseFloat(discountAmount) || 0,
        paymentMethod: paymentMethod,
        items: items.map((it) => ({
          medicineId: parseInt(it.medicineId),
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      };

      const res = await SaleAPI.create(payload);
      if (res.data?.success) {
        const createdSale = res.data.data;
        setAlert({
          type: 'success',
          message: `Sale completed! Invoice ${createdSale.invoiceNumber} generated and stock decreased in PostgreSQL.`,
        });
        setIsNewSaleOpen(false);
        setInvoiceModal(createdSale);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sales &amp; Billing Terminal</h2>
          <p className="text-xs text-slate-500 mt-0.5">Dispense medicines, generate customer invoices, and update inventory</p>
        </div>
        <button
          onClick={handleOpenNewSale}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <Receipt className="w-4 h-4 mr-1.5" />
          New Sale / Bill
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Sales History Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No sales transactions recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold text-right">Gross (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Discount (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Net Billed (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s.saleId} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">{s.invoiceNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {s.customerName}
                      <span className="block text-[10px] text-slate-400 font-normal">{s.customerPhone}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(s.saleDate).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">₹{s.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-slate-500">₹{s.discountAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      ₹{s.netAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setInvoiceModal(s)}
                        className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium inline-flex items-center"
                      >
                        <Eye className="w-3 h-3 mr-1" /> Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POS New Sale Modal */}
      <Modal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        title="Create Customer Sales Bill"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCompleteSale} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Customer *</label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.customerName} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="CARD">DEBIT/CREDIT CARD</option>
                <option value="CREDIT">CUSTOMER CREDIT</option>
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Prescription / Medicine Items</span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Medicine
              </button>
            </div>

            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-medium">Medicine Item</th>
                    <th className="py-2 px-3 font-medium w-24 text-center">Stock</th>
                    <th className="py-2 px-3 font-medium w-20">Qty</th>
                    <th className="py-2 px-3 font-medium w-24 text-right">Price (₹)</th>
                    <th className="py-2 px-3 font-medium w-24 text-right">Total (₹)</th>
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
                            <option
                              key={m.medicineId}
                              value={m.medicineId}
                              disabled={m.expired || m.quantity === 0}
                            >
                              {m.medicineName} (Stock: {m.quantity})
                              {m.expired ? ' [EXPIRED]' : m.quantity === 0 ? ' [OUT OF STOCK]' : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            it.availableStock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {it.availableStock}
                        </span>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          max={it.availableStock || 9999}
                          required
                          value={it.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-2 text-right font-mono text-slate-700">
                        ₹{(it.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-800">
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

          {/* Subtotal, Discount, Net Billed */}
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Gross Bill Amount:</span>
              <span className="font-mono">₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Discount (₹):</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-24 px-2 py-1 text-right text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-200">
              <span>Net Payable:</span>
              <span className="text-emerald-700">₹{calculateNetAmount().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewSaleOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-sm"
            >
              Generate Bill &amp; Deduct Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Receipt Modal */}
      <Modal
        isOpen={!!invoiceModal}
        onClose={() => setInvoiceModal(null)}
        title="Pharmacy Billing Invoice"
        maxWidth="max-w-xl"
      >
        {invoiceModal && (
          <div className="space-y-4 text-xs font-sans">
            <div className="text-center pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-800">PHARMACARE RETAIL MEDICALS</h2>
              <p className="text-[11px] text-slate-500">Reg No: MH-PUN-2026-9901 | GSTIN: 27AAAAA0000A1Z5</p>
              <p className="text-[11px] text-slate-500">Pune, Maharashtra - 411001</p>
            </div>

            <div className="flex justify-between bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <p><strong className="text-slate-800">Invoice:</strong> <span className="font-mono">{invoiceModal.invoiceNumber}</span></p>
                <p><strong className="text-slate-800">Customer:</strong> {invoiceModal.customerName}</p>
                <p><strong className="text-slate-800">Phone:</strong> {invoiceModal.customerPhone}</p>
              </div>
              <div className="text-right">
                <p><strong className="text-slate-800">Date:</strong> {new Date(invoiceModal.saleDate).toLocaleDateString()}</p>
                <p><strong className="text-slate-800">Mode:</strong> {invoiceModal.paymentMethod}</p>
                <p><strong className="text-slate-800">Status:</strong> {invoiceModal.status}</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2">Item</th>
                  <th className="p-2">Batch</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Rate</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceModal.items?.map((it) => (
                  <tr key={it.saleItemId}>
                    <td className="p-2 font-medium text-slate-800">{it.medicineName}</td>
                    <td className="p-2 font-mono text-[11px] text-slate-500">{it.batchNumber}</td>
                    <td className="p-2 text-center">{it.quantity}</td>
                    <td className="p-2 text-right font-mono">₹{it.unitPrice.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono font-medium">₹{it.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 text-right text-xs pt-2">
              <p className="text-slate-600">Subtotal: <span className="font-mono font-medium">₹{invoiceModal.totalAmount.toFixed(2)}</span></p>
              <p className="text-slate-600">Discount: <span className="font-mono">₹{invoiceModal.discountAmount.toFixed(2)}</span></p>
              <p className="text-sm font-bold text-slate-900 border-t border-slate-200 pt-1">
                Net Paid: <span className="text-emerald-700 font-mono">₹{invoiceModal.netAmount.toFixed(2)}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[10px] text-slate-400">Inventory automatically adjusted via PostgreSQL trigger.</span>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-medium inline-flex items-center hover:bg-slate-700"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

