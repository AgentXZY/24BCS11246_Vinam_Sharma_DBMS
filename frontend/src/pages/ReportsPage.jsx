import React, { useEffect, useState } from 'react';
import { ReportAPI } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import {
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  History,
  RefreshCw,
  Calendar,
  FileText
} from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('MONTHLY'); // MONTHLY, BEST_SELLERS, DAILY, INVENTORY, AUDIT
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [monthlyData, setMonthlyData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [inventorySummary, setInventorySummary] = useState([]);
  const [stockAudit, setStockAudit] = useState([]);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'MONTHLY') {
        const res = await ReportAPI.getMonthly(selectedYear);
        if (res.data?.success) setMonthlyData(res.data.data);
      } else if (activeTab === 'BEST_SELLERS') {
        const res = await ReportAPI.getBestSellers(10);
        if (res.data?.success) setBestSellers(res.data.data);
      } else if (activeTab === 'DAILY') {
        const res = await ReportAPI.getDailySales();
        if (res.data?.success) setDailySales(res.data.data);
      } else if (activeTab === 'INVENTORY') {
        const res = await ReportAPI.getInventorySummary();
        if (res.data?.success) setInventorySummary(res.data.data);
      } else if (activeTab === 'AUDIT') {
        const res = await ReportAPI.getStockTransactions();
        if (res.data?.success) setStockAudit(res.data.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to fetch report from PostgreSQL engine' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab, selectedYear]);

  const tabs = [
    { id: 'MONTHLY', name: 'Monthly Revenue (PL/pgSQL Function)', icon: Calendar },
    { id: 'BEST_SELLERS', name: 'Best Sellers (PL/pgSQL Function)', icon: Award },
    { id: 'DAILY', name: 'Daily Sales (PostgreSQL View)', icon: TrendingUp },
    { id: 'INVENTORY', name: 'Category Valuation (PostgreSQL View)', icon: Layers },
    { id: 'AUDIT', name: 'Stock Audit Log (Triggers)', icon: History },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">DBMS Analytics &amp; Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">Database stored procedures, functions, aggregation views and audit trails</p>
        </div>
        <button
          onClick={fetchReportData}
          className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          Refresh Report
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mr-1.5" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Monthly Sales Report */}
      {activeTab === 'MONTHLY' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Monthly Sales Revenue Report</h3>
              <p className="text-[11px] text-slate-500 font-mono">Executed via PostgreSQL Function: get_monthly_sales_report({selectedYear})</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-medium"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>
          ) : monthlyData.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No monthly sales data found for {selectedYear}.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Month #</th>
                    <th className="py-3 px-4 font-semibold">Month Name</th>
                    <th className="py-3 px-4 font-semibold text-center">Orders Count</th>
                    <th className="py-3 px-4 font-semibold text-right">Gross Sales (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Discounts (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Net Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-500">{row.monthNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.monthName}</td>
                      <td className="py-3 px-4 text-center">{row.totalOrders}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">₹{row.grossSales.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">₹{row.totalDiscount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">₹{row.netRevenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Best-Selling Medicines */}
      {activeTab === 'BEST_SELLERS' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800">Top Performing Medicines by Volume &amp; Sales</h3>
            <p className="text-[11px] text-slate-500 font-mono">Executed via PostgreSQL Function: get_best_selling_medicines(10)</p>
          </div>

          {loading ? (
            <div className="p-12 text-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>
          ) : bestSellers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No sales transactions available for ranking.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-16">Rank</th>
                    <th className="py-3 px-4 font-semibold">Medicine Name</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold text-center">Units Sold</th>
                    <th className="py-3 px-4 font-semibold text-right">Revenue Generated (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bestSellers.map((item, idx) => (
                    <tr key={item.medicineId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-700">#{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.medicineName}</td>
                      <td className="py-3 px-4 text-slate-600">{item.categoryName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          {item.totalSold} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        ₹{item.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Daily Sales Summary View */}
      {activeTab === 'DAILY' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800">Daily Sales Summary</h3>
            <p className="text-[11px] text-slate-500 font-mono">Queried directly from PostgreSQL View: sales_summary</p>
          </div>

          {loading ? (
            <div className="p-12 text-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>
          ) : dailySales.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No daily sales view records.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-center">Invoices Count</th>
                    <th className="py-3 px-4 font-semibold text-right">Gross Sales (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Discounts (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Net Revenue (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Avg Basket (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailySales.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">{String(row.sale_date)}</td>
                      <td className="py-3 px-4 text-center font-medium">{row.total_invoices}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">₹{parseFloat(row.gross_sales || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">₹{parseFloat(row.total_discount || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">₹{parseFloat(row.net_revenue || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">₹{parseFloat(row.average_bill_value || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Category Inventory Summary View */}
      {activeTab === 'INVENTORY' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800">Category-Level Inventory Valuation &amp; Projected Profit</h3>
            <p className="text-[11px] text-slate-500 font-mono">Queried directly from PostgreSQL View: medicine_inventory_summary</p>
          </div>

          {loading ? (
            <div className="p-12 text-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>
          ) : inventorySummary.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No inventory valuation records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold text-center">Medicines Count</th>
                    <th className="py-3 px-4 font-semibold text-center">Stock Units</th>
                    <th className="py-3 px-4 font-semibold text-right">Cost Valuation (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Retail Potential (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Projected Profit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventorySummary.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.category_name}</td>
                      <td className="py-3 px-4 text-center">{row.total_medicines}</td>
                      <td className="py-3 px-4 text-center font-medium">{row.total_stock_units}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">₹{parseFloat(row.total_inventory_cost || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">₹{parseFloat(row.total_potential_revenue || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">₹{parseFloat(row.projected_profit || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Real-Time Stock Transactions Audit Log */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800">Database Stock Movement Audit Trail</h3>
            <p className="text-[11px] text-slate-500 font-mono">Recorded automatically via PostgreSQL Triggers: trg_after_purchase_item_insert &amp; trg_before_sale_item_insert</p>
          </div>

          {loading ? (
            <div className="p-12 text-center"><RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>
          ) : stockAudit.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No stock audit records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-16">Tx ID</th>
                    <th className="py-3 px-4 font-semibold">Medicine</th>
                    <th className="py-3 px-4 font-semibold text-center">Type</th>
                    <th className="py-3 px-4 font-semibold text-center">Qty Delta</th>
                    <th className="py-3 px-4 font-semibold text-center">Prev Stock</th>
                    <th className="py-3 px-4 font-semibold text-center">New Stock</th>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockAudit.map((tx) => (
                    <tr key={tx.transactionId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{tx.transactionId}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{tx.medicine?.medicineName}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            tx.transactionType === 'PURCHASE'
                              ? 'bg-blue-100 text-blue-800'
                              : tx.transactionType === 'SALE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span className={tx.quantityChanged > 0 ? 'text-blue-600' : 'text-emerald-600'}>
                          {tx.quantityChanged > 0 ? `+${tx.quantityChanged}` : tx.quantityChanged}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">{tx.previousStock}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{tx.currentStock}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(tx.transactionDate).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{tx.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

