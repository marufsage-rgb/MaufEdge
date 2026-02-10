
import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { ERPData } from '../types';
import { TrendingUp, TrendingDown, Package, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';

interface Props {
  data: ERPData;
  t: (key: any) => string;
}

const Dashboard: React.FC<Props> = ({ data, t }) => {
  const currency = data.settings.currency;
  const isRTL = data.settings.language === 'ar';
  
  const totalStockValue = data.products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const lowStockItems = data.products.filter(p => p.stock <= p.minStockLevel);
  const totalSales = data.sales.reduce((acc, s) => acc + s.totalAmount, 0);

  const formatMoney = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString(data.settings.language, { weekday: 'short' });
    const amount = data.sales
      .filter(s => new Date(s.timestamp).toDateString() === d.toDateString())
      .reduce((acc, s) => acc + s.totalAmount, 0);
    return { name: dayStr, sales: amount };
  });

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${isRTL ? 'text-right' : ''}`}>
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'} ${isRTL ? 'flex-row-reverse' : ''}`}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800" dir="ltr">
           {isRTL ? `${formatMoney(parseFloat(value.replace(/[^0-9.]/g, '')))} ${currency}` : `${currency} ${formatMoney(parseFloat(value.replace(/[^0-9.]/g, '')))}`}
        </h3>
      </div>
    </div>
  );

  return (
    <div className={`space-y-8 max-w-7xl mx-auto ${isRTL ? 'font-arabic' : ''}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('total_balance')} 
          value={data.cashBalance.toString()} 
          icon={DollarSign} 
          color="indigo" 
          trend={12.5}
        />
        <StatCard 
          title={t('revenue')} 
          value={totalSales.toString()} 
          icon={ShoppingCart} 
          color="emerald" 
          trend={8.2}
        />
        <StatCard 
          title={t('stock_value')} 
          value={totalStockValue.toString()} 
          icon={Package} 
          color="amber" 
        />
        <StatCard 
          title={t('alerts')} 
          value={lowStockItems.length.toString()} 
          icon={AlertTriangle} 
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className="text-lg font-bold text-slate-800">Trend</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} reversed={isRTL} />
                <YAxis hide orientation={isRTL ? 'right' : 'left'} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fill="#4f46e520" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className={`text-lg font-bold text-slate-800 mb-6 ${isRTL ? 'text-right' : ''}`}>{t('alerts')}</h3>
          <div className="space-y-4">
            {lowStockItems.length > 0 ? lowStockItems.map(p => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm font-semibold text-rose-900">{p.name}</p>
                  <p className="text-xs text-rose-600">{p.stock} {p.unit}</p>
                </div>
                <button className="text-xs font-bold text-rose-700 hover:underline">Restock</button>
              </div>
            )) : (
              <div className="text-center py-12">
                <Package size={20} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-500">Healthy</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
