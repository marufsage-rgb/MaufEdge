
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Settings as SettingsIcon, 
  Bot, 
  Menu, 
  X,
  Bell,
  Plus,
  FileText,
  RefreshCw,
  Database,
  Download,
  Users
} from 'lucide-react';
import { ERPData, Sale, Transaction } from './types';
import { translations, Language } from './services/translations';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import SalesPOS from './components/SalesPOS';
import Finance from './components/Finance';
import AutomationHub from './components/AutomationHub';
import Reports from './components/Reports';
import Settings from './components/Settings';
import HR from './components/HR';

const INITIAL_DATA: ERPData = {
  products: [
    { 
      id: '1', 
      name: 'Premium Coffee Beans', 
      category: 'Beverages', 
      price: 45.000, 
      costPrice: 28.500,
      stock: 15, 
      minStockLevel: 20, 
      unit: 'kg',
      imageUrls: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400'],
      primaryImageIndex: 0,
      supplier: { name: 'Oman Trading Co.', contact: '+968 2400 0000', email: 'info@omantrading.om', leadTime: '3-5 days' },
      stockHistory: [{ timestamp: Date.now() - 172800000, change: 50, type: 'restock', note: 'Initial stock' }]
    }
  ],
  sales: [],
  transactions: [],
  staff: [
    { id: 's1', name: 'Ahmed Al-Said', position: 'Manager', salary: 1200, status: 'active', joiningDate: Date.now() - 31536000000 }
  ],
  bankAccounts: [
    { id: 'b1', bankName: 'Bank Muscat', accountNumber: 'xxxx-xxxx-1234', balance: 5000, type: 'current' }
  ],
  cashBalance: 2500,
  settings: {
    companyName: 'MarufEdge Oman',
    userName: 'Admin',
    userEmail: 'admin@marufedge.om',
    currency: 'OMR',
    language: 'en',
    taxRate: 5.0, // VAT in Oman is 5%
    sqlServerStatus: 'connected',
    lastBackup: Date.now() - 3600000
  }
};

const App: React.FC = () => {
  const [data, setData] = useState<ERPData>(() => {
    const saved = localStorage.getItem('marufedge_erp_oman_v1');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const lang = data.settings.language || 'en';
  const t = (key: keyof typeof translations.en) => translations[lang][key] || key;
  const isRTL = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('marufedge_erp_oman_v1', JSON.stringify(data));
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [data, isRTL, lang]);

  const triggerSync = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  }, []);

  const addSale = useCallback((sale: Sale) => {
    triggerSync();
    setData(prev => {
      const updatedProducts = prev.products.map(p => {
        const itemInSale = sale.items.find(i => i.productId === p.id);
        if (itemInSale) return { ...p, stock: p.stock - itemInSale.quantity };
        return p;
      });
      return {
        ...prev,
        sales: [...prev.sales, sale],
        products: updatedProducts,
        cashBalance: prev.cashBalance + sale.totalAmount,
        transactions: [...prev.transactions, {
          id: `sale-${sale.id}`,
          timestamp: sale.timestamp,
          type: 'income',
          category: 'Sales',
          amount: sale.totalAmount,
          description: `Sale #${sale.id.slice(0, 8)}`
        }]
      };
    });
  }, [triggerSync]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    triggerSync();
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, { ...tx, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }],
      cashBalance: tx.type === 'income' ? prev.cashBalance + tx.amount : prev.cashBalance - tx.amount
    }));
  }, [triggerSync]);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'sales', label: t('sales'), icon: ShoppingCart },
    { id: 'hr', label: t('hr'), icon: Users },
    { id: 'finance', label: t('finance'), icon: Wallet },
    { id: 'reports', label: t('reports'), icon: FileText },
    { id: 'ai', label: t('ai'), icon: Bot },
    { id: 'settings', label: t('settings'), icon: SettingsIcon },
  ];

  const renderContent = () => {
    const props = { data, onUpdate: setData, t, isRTL };
    switch (activeTab) {
      case 'dashboard': return <Dashboard data={data} t={t} />;
      case 'inventory': return <Inventory products={data.products} sales={data.sales} onUpdate={setData} t={t} currency={data.settings.currency} />;
      case 'sales': return <SalesPOS products={data.products} onCompleteSale={addSale} t={t} currency={data.settings.currency} />;
      case 'finance': return <Finance data={data} onAddTransaction={addTransaction} onUpdate={setData} t={t} />;
      case 'hr': return <HR data={data} onUpdate={setData} t={t} />;
      case 'ai': return <AutomationHub data={data} t={t} />;
      case 'reports': return <Reports data={data} t={t} />;
      case 'settings': return <Settings data={data} onUpdate={setData} t={t} />;
      default: return <Dashboard data={data} t={t} />;
    }
  };

  return (
    <div className={`flex min-h-screen bg-slate-50 overflow-hidden font-sans select-none ${isRTL ? 'font-arabic' : ''}`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-64 bg-white border-${isRTL ? 'l' : 'r'} border-slate-200 transform transition-transform duration-300 md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Package size={24} />
            </div>
            <div>
              <h1 className="font-black text-slate-800 tracking-tighter leading-none">{data.settings.companyName}</h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Oman Edition</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Icon size={20} className={isRTL ? 'order-2' : ''} />
                  <span className={`text-sm ${isRTL ? 'order-1 text-right flex-1' : ''}`}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 space-y-3">
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm">
                {data.settings.userName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{data.settings.userName}</p>
                <p className="text-[10px] text-slate-500 truncate font-medium">{data.settings.userEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className={`p-2 ${isRTL ? '-mr-2' : '-ml-2'} text-slate-500 md:hidden`} onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
            <h2 className="text-lg font-bold text-slate-800">{t(activeTab as any)}</h2>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
              <div className="flex items-center gap-1.5">
                {isSyncing ? <RefreshCw size={12} className="text-indigo-600 animate-spin" /> : <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{isSyncing ? t('syncing') : t('mysql_live')}</span>
              </div>
              <Database size={14} className="text-slate-400" />
            </div>
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative"><Bell size={20} /><span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
