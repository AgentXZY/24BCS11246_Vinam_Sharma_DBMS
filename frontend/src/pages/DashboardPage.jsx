import React, { useEffect, useState } from 'react';
import { ReportAPI, MedicineAPI, SaleAPI } from '../services/api';
import {
  Pill,
  Truck,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expired, setExpired] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, lowRes, expRes, salesRes] = await Promise.all([
        ReportAPI.getDashboard(),
        MedicineAPI.getLowStock(),
        MedicineAPI.getExpired(),
        SaleAPI.getAll()
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (lowRes.data?.success) setLowStock(lowRes.data.data.slice(0, 5));
      if (expRes.data?.success) setExpired(expRes.data.data.slice(0, 5));
      if (salesRes.data?.success) setRecentSales(salesRes.data.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Medicines',
      value: stats?.totalMedicines ?? 0,
      icon: Pill,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/medicines'
    },
    {
      title: 'Total Suppliers',
      value: stats?.totalSuppliers ?? 0,
      icon: Truck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      link: '/suppliers'
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/customers'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/reports'
    },
    {
      title: 'Low-Stock Medicines',
      value: stats?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      link: '/medicines?filter=low-stock'
    },
    {
      title: 'Expired Medicines',
      value: stats?.expiredCount ?? 0,
      icon: Clock,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      link: '/medicines?filter=expired'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pharmacy System Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time inventory and database transaction status</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          Refresh
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-shadow block"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{card.title}</span>
                <div className={`p-1.5 rounded-md ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl font-bold text-slate-800">{card.value}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two-Column Alert & Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800">Low Stock Inventory Alerts</h3>
            </div>
            <Link to="/medicines" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
              View All <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="p-4">
            {lowStock.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">All inventory stock levels are healthy.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="pb-2 font-medium">Medicine</th>
                      <th className="pb-2 font-medium">Category</th>
                      <th className="pb-2 font-medium">Current Stock</th>
                      <th className="pb-2 font-medium">Min Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lowStock.map((med) => (
                      <tr key={med.medicineId} className="hover:bg-slate-50">
                        <td className="py-2.5 font-medium text-slate-800">{med.medicineName}</td>
                        <td className="py-2.5 text-slate-600">{med.categoryName}</td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                            {med.quantity} units
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-500">{med.minStockLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Expired Medicines Alert */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-semibold text-slate-800">Expired Medicines (Blocked from Sale)</h3>
            </div>
            <Link to="/medicines" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
              View All <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="p-4">
            {expired.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No expired medicines in stock.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="pb-2 font-medium">Medicine</th>
                      <th className="pb-2 font-medium">Batch</th>
                      <th className="pb-2 font-medium">Quantity</th>
                      <th className="pb-2 font-medium">Expired Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expired.map((med) => (
                      <tr key={med.medicineId} className="hover:bg-slate-50">
                        <td className="py-2.5 font-medium text-slate-800">{med.medicineName}</td>
                        <td className="py-2.5 text-slate-500 font-mono text-[11px]">{med.batchNumber}</td>
                        <td className="py-2.5 text-slate-600">{med.quantity} units</td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                            {med.expiryDate}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Recent Sales Transactions</h3>
          <Link to="/sales" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
            New Sale / Billing <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
        <div className="p-4">
          {recentSales.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent sales records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3 font-medium">Invoice #</th>
                    <th className="py-2.5 px-3 font-medium">Customer</th>
                    <th className="py-2.5 px-3 font-medium">Payment</th>
                    <th className="py-2.5 px-3 font-medium text-right">Net Amount</th>
                    <th className="py-2.5 px-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.map((sale) => (
                    <tr key={sale.saleId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{sale.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-700">{sale.customerName}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{sale.paymentMethod}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 text-right">
                        ₹{(sale.netAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

