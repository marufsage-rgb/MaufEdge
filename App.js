
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Wallet, Settings as SettingsIcon, 
  Bot, Menu, Bell, FileText, RefreshCw, Database, Users 
} from 'lucide-react';
import { translations } from './services/translations.js';
import Dashboard from './components/Dashboard.js';
import Inventory from './components/Inventory.js';
import SalesPOS from './components/SalesPOS.js';
import Finance from './components/Finance.js';
import AutomationHub from './components/AutomationHub.js';
import Reports from './components/Reports.js';
import Settings from './components/Settings.js';
import HR from './components/HR.js';
import Logo from './components/Logo.js';

const INITIAL_DATA = {
  products: [
    { 
      id: '1', name: 'Premium Coffee Beans', category: 'Beverages', price: 45.000, 
      costPrice: 28.500, stock: 15, minStockLevel: 20, unit: 'kg',
      imageUrls: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400'],
      primaryImageIndex: 0,
      supplier: { name: 'Oman Trading Co.', contact: '+968 2400 0000', email: 'info@omantrading.om', leadTime: '3-5 days' },
      stockHistory: [{ timestamp: Date.now() - 172800000, change: 50, type: 'restock', note: 'Initial stock' }]
    }
  ],
  sales: [], transactions: [], staff: [], bankAccounts: [], cashBalance: 2500,
  settings: { companyName: 'MarufEdge ProMedia', userName: 'Admin', userEmail: 'admin@promedia.om', currency: 'OMR', language: 'en', taxRate: 5.0, sqlServerStatus: 'connected', lastBackup: Date.now() }
};

const App = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('marufedge_erp_oman_v1');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const lang = data.settings.language || 'en';
  const t = (key) => translations[lang][key] || key;
  const isRTL = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('marufedge_erp_oman_v1', JSON.stringify(data));
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [data, isRTL, lang]);

  const addSale = useCallback((sale) => {
    setIsSyncing(true);
    setData(prev => ({
      ...prev,
      sales: [...prev.sales, sale],
      cashBalance: prev.cashBalance + sale.totalAmount
    }));
    setTimeout(() => setIsSyncing(false), 800);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'sales', label: t('sales'), icon: ShoppingCart },
    { id: 'finance', label: t('finance'), icon: Wallet },
    { id: 'settings', label: t('settings'), icon: SettingsIcon },
  ];

  return (
    React.createElement("div", { className: "flex min-h-screen bg-slate-50" },
      React.createElement("aside", { className: "w-64 bg-white border-r border-slate-200 hidden md:block" },
        React.createElement("div", { className: "p-6" }, React.createElement(Logo, { size: 40 })),
        React.createElement("nav", { className: "px-4 space-y-2" },
          menuItems.map(item => React.createElement("button", { 
            key: item.id, 
            onClick: () => setActiveTab(item.id),
            className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`
          }, React.createElement(item.icon, { size: 20 }), item.label))
        )
      ),
      React.createElement("main", { className: "flex-1 overflow-auto" },
        React.createElement("header", { className: "h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8" },
          React.createElement("h2", { className: "font-bold" }, t(activeTab)),
          React.createElement("div", { className: "flex items-center gap-4" }, 
            isSyncing && React.createElement(RefreshCw, { size: 16, className: "animate-spin text-indigo-600" }),
            React.createElement(Database, { size: 18, className: "text-slate-400" })
          )
        ),
        React.createElement("div", { className: "p-8" },
          activeTab === 'dashboard' && React.createElement(Dashboard, { data, t }),
          activeTab === 'inventory' && React.createElement(Inventory, { products: data.products, onUpdate: setData, t, currency: data.settings.currency }),
          activeTab === 'sales' && React.createElement(SalesPOS, { products: data.products, onCompleteSale: addSale, t, currency: data.settings.currency, settings: data.settings }),
          activeTab === 'finance' && React.createElement(Finance, { data, onUpdate: setData, t }),
          activeTab === 'settings' && React.createElement(Settings, { data, onUpdate: setData, t })
        )
      )
    )
  );
};

export default App;
