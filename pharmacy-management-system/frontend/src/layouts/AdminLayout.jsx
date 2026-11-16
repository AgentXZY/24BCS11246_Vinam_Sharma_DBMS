import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Tags,
  Truck,
  Users,
  ShoppingCart,
  Receipt,
  BarChart3,
  Database,
  CheckCircle2
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Medicines', path: '/medicines', icon: Pill },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Suppliers', path: '/suppliers', icon: Truck },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Purchases', path: '/purchases', icon: ShoppingCart },
  { name: 'Sales & Billing', path: '/sales', icon: Receipt },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between">
        <div>
          {/* Logo / Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-600 rounded text-white">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-base leading-tight">PharmaCare</h1>
                <p className="text-xs text-slate-500 font-medium">DBMS Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Database Status Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Database className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">PostgreSQL 18</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 ml-auto">
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">pharmacy_management DB</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
              {navItems.find((item) => item.path === location.pathname)?.name || 'Pharmacy System'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
              <span>ACID Transactions &amp; Triggers Active</span>
            </div>
            <div className="flex items-center space-x-2 border-l pl-4 border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 leading-none">Admin Pharmacist</p>
                <p className="text-[10px] text-slate-400">admin@pharmacy.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

