
import React from 'react';
import { DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react';

const Dashboard = ({ data, t }) => {
  const currency = data.settings.currency;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <DollarSign className="text-indigo-600 mb-2" size={24} />
        <p className="text-sm text-slate-500">{t('total_balance')}</p>
        <h3 className="text-2xl font-bold">{currency} {data.cashBalance.toLocaleString()}</h3>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <ShoppingCart className="text-emerald-600 mb-2" size={24} />
        <p className="text-sm text-slate-500">{t('revenue')}</p>
        <h3 className="text-2xl font-bold">{currency} {data.sales.reduce((a, s) => a + s.totalAmount, 0).toLocaleString()}</h3>
      </div>
    </div>
  );
};

export default Dashboard;
