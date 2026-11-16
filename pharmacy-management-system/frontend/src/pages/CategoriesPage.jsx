import React, { useEffect, useState } from 'react';
import { CategoryAPI } from '../services/api';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { Plus, Edit2, Trash2, RefreshCw, Tags } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ categoryName: '', description: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await CategoryAPI.getAll();
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to fetch categories' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ categoryName: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.categoryId);
    setFormData({ categoryName: cat.categoryName, description: cat.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await CategoryAPI.update(editingId, formData);
        setAlert({ type: 'success', message: 'Category updated successfully' });
      } else {
        await CategoryAPI.create(formData);
        setAlert({ type: 'success', message: 'Category created successfully' });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category '${name}'? (Cannot be deleted if medicines belong to it)`)) return;
    try {
      await CategoryAPI.delete(id);
      setAlert({ type: 'success', message: `Category '${name}' deleted successfully` });
      fetchCategories();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Medicine Categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">Therapeutic classifications and drug groups</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Category
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No categories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold w-16">ID</th>
                  <th className="py-3 px-4 font-semibold w-64">Category Name</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.categoryId} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{c.categoryId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.categoryName}</td>
                    <td className="py-3 px-4 text-slate-600">{c.description || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.categoryId, c.categoryName)}
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Cardiovascular"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Describe therapeutic usage..."
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
    </div>
  );
}

