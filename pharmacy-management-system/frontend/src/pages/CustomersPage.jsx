import React, { useEffect, useState } from 'react';
import { CustomerAPI } from '../services/api';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { Plus, Edit2, Trash2, Search, RefreshCw, History, Receipt } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
  });

  // Purchase History Modal
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await CustomerAPI.getAll(search.trim() ? { search: search.trim() } : {});
      if (res.data?.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to fetch customers' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ customerName: '', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.customerId);
    setFormData({
      customerName: c.customerName,
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await CustomerAPI.update(editingId, formData);
        setAlert({ type: 'success', message: 'Customer details updated successfully' });
      } else {
        await CustomerAPI.create(formData);
        setAlert({ type: 'success', message: 'Customer registered successfully' });
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer '${name}'? (Cannot delete if sales history exists)`)) return;
    try {
      await CustomerAPI.delete(id);
      setAlert({ type: 'success', message: `Customer '${name}' deleted successfully` });
      fetchCustomers();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleViewHistory = async (customer) => {
    setHistoryCustomer(customer);
    setHistoryLoading(true);
    try {
      const res = await CustomerAPI.getPurchases(customer.customerId);
      if (res.data?.success) {
        setPurchaseHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pharmacy Customers</h2>
          <p className="text-xs text-slate-500 mt-0.5">Patient database, prescription holders, and purchase histories</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Customer
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customers by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={fetchCustomers}
          className="p-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-600"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold w-16">ID</th>
                  <th className="py-3 px-4 font-semibold">Customer Name</th>
                  <th className="py-3 px-4 font-semibold">Phone</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Address</th>
                  <th className="py-3 px-4 font-semibold text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{c.customerId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.customerName}</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">{c.phone}</td>
                    <td className="py-3 px-4 text-slate-600">{c.email || '-'}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{c.address || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewHistory(c)}
                          className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium flex items-center"
                          title="View Invoices"
                        >
                          <History className="w-3 h-3 mr-1" /> History
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.customerId, c.customerName)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Customer Full Name *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="customer@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Residential Address</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Address / Area"
            />
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
              {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Purchase History Modal */}
      <Modal
        isOpen={!!historyCustomer}
        onClose={() => setHistoryCustomer(null)}
        title={`Purchase History - ${historyCustomer?.customerName}`}
        maxWidth="max-w-2xl"
      >
        {historyLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : purchaseHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No previous billing invoices found for this customer.
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {purchaseHistory.map((sale) => (
              <div key={sale.saleId} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800">{sale.invoiceNumber}</span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800">₹{(sale.netAmount || 0).toFixed(2)}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded ml-2">
                      {sale.paymentMethod}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {sale.items?.map((it) => (
                    <div key={it.saleItemId} className="flex justify-between text-xs text-slate-600">
                      <span>{it.medicineName} (x{it.quantity})</span>
                      <span className="font-mono">₹{it.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

