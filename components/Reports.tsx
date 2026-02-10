
import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { ERPData, Sale, Transaction } from '../types';
import { 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Filter, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  DollarSign,
  PieChart as PieChartIcon,
  Layers,
  Activity,
  ArrowUpCircle,
  ArrowDownCircle,
  Briefcase,
  Building2,
  ShieldCheck,
  Search,
  Plus
} from 'lucide-react';

interface Props {
  data: ERPData;
  t: (key: any) => string;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Reports: React.FC<Props> = ({ data, t }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterMethod, setFilterMethod] = useState<string>('All');

  const currency = data.settings.currency;

  const categories = useMemo(() => ['All', ...new Set(data.products.map(p => p.category))], [data.products]);

  const filteredSales = useMemo(() => {
    const start = new Date(dateRange.start).getTime();
    const end = new Date(dateRange.end).setHours(23, 59, 59, 999);
    
    return data.sales.filter(s => {
      const withinDate = s.timestamp >= start && s.timestamp <= end;
      const matchesMethod = filterMethod === 'All' || s.paymentMethod === filterMethod;
      const matchesCategory = filterCategory === 'All' || s.items.some(item => {
        const prod = data.products.find(p => p.id === item.productId);
        return prod?.category === filterCategory;
      });
      return withinDate && matchesMethod && matchesCategory;
    });
  }, [data.sales, dateRange, filterCategory, filterMethod, data.products]);

  const financials = useMemo(() => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const revenue = filteredSales.reduce((acc, s) => acc + s.subtotal, 0); 
    const collectedTax = filteredSales.reduce((acc, s) => acc + s.taxAmount, 0);
    
    // Calculate accurate COGS using specific product cost prices
    let cogs = 0;
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const prod = data.products.find(p => p.id === item.productId);
        cogs += (prod?.costPrice || (item.price * 0.7)) * item.quantity;
      });
    });

    const expenses = data.transactions
      .filter(t => t.type === 'expense' && t.category !== 'Salary' && t.timestamp >= startDate.getTime() && t.timestamp <= endDate.getTime())
      .reduce((acc, t) => acc + t.amount, 0);

    // Calculate Salaries for the specific period (based on monthly rates)
    const monthlySalaries = data.staff.filter(s => s.status === 'active').reduce((acc, s) => acc + s.salary, 0);
    const periodicSalaries = (monthlySalaries / 30) * diffDays;
    
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses - periodicSalaries;

    return { 
      revenue, 
      collectedTax, 
      cogs, 
      expenses, 
      salaries: periodicSalaries, 
      netProfit, 
      grossProfit,
      diffDays
    };
  }, [filteredSales, data.transactions, data.staff, data.products, dateRange]);

  const dailyDeposits = useMemo(() => {
    const days: Record<string, number> = {};
    filteredSales.forEach(s => {
      const date = new Date(s.timestamp).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      days[date] = (days[date] || 0) + s.totalAmount;
    });
    return Object.entries(days).map(([name, amount]) => ({ name, amount }));
  }, [filteredSales]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Search & Action Header */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Financial Command Center</h3>
              <p className="text-slate-400 text-sm">Real-time P&L, Tax Tracking, and Liquidity Audit.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all">
              <Printer size={20}/>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95">
              <Download size={20}/> Export Audit Trail
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date From</label>
            <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-100" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date To</label>
            <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-100" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category Filter</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-100" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Method Filter</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-100" value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
              <option value="All">All Payment Modes</option>
              <option value="cash">Cash Deposits</option>
              <option value="card">Card / Terminal</option>
              <option value="online">Online / Gateway</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-600"><DollarSign size={80}/></div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Period Revenue</p>
          <h4 className="text-3xl font-black text-slate-800">{currency} {financials.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
          <div className="flex items-center gap-2 mt-4">
             <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase">Gross Income</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-600"><TrendingUp size={80}/></div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Net Profit/Loss</p>
          <h4 className={`text-3xl font-black ${financials.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
             {currency} {financials.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h4>
          <div className="flex items-center gap-2 mt-4">
             <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${financials.netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {financials.netProfit >= 0 ? 'Surplus' : 'Deficit'}
             </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-600"><ShieldCheck size={80}/></div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tax Liability</p>
          <h4 className="text-3xl font-black text-slate-800">{currency} {financials.collectedTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
          <div className="flex items-center gap-2 mt-4">
             <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded uppercase">VAT @ {data.settings.taxRate}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-rose-600"><ArrowDownCircle size={80}/></div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Operational Ex</p>
          <h4 className="text-3xl font-black text-slate-800">{currency} {(financials.expenses + financials.salaries).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
          <div className="flex items-center gap-2 mt-4">
             <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded uppercase">Bills & Payroll</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Cashflow View */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" /> Daily Revenue Inflow
            </h3>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase">Sales Deposits</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyDeposits}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `${currency}${v}`} />
                <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorInflow)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Profit & Loss Statement */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layers size={20} className="text-emerald-600" /> P&L Statement Details
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase">{financials.diffDays} Days Reporting</span>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div><p className="font-bold text-slate-800">Total Sales (Gross)</p><p className="text-[10px] text-slate-400 font-bold uppercase">Before COGS</p></div>
               <p className="font-black text-indigo-600">+{currency} {financials.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
               <div><p className="font-bold text-slate-800">Cost of Goods (COGS)</p><p className="text-[10px] text-slate-400 font-bold uppercase">Inventory Cost</p></div>
               <p className="font-black text-rose-500">-{currency} {financials.cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
               <div><p className="font-bold text-slate-800">Operational Expenses</p><p className="text-[10px] text-slate-400 font-bold uppercase">Rent, Utility, etc</p></div>
               <p className="font-black text-rose-500">-{currency} {financials.expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
               <div><p className="font-bold text-slate-800">Employment Salary</p><p className="text-[10px] text-slate-400 font-bold uppercase">Payroll Allocation</p></div>
               <p className="font-black text-rose-500">-{currency} {financials.salaries.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
               <div><p className="text-xl font-black text-slate-800">Net Business Result</p><p className="text-[10px] text-slate-400 font-bold uppercase">Final Profit/Loss</p></div>
               <div className="text-right">
                  <p className={`text-3xl font-black ${financials.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {currency} {financials.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank & Liquidity Monitoring Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-10">
          <div className="space-y-8 flex-1">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20"><Building2 size={32}/></div>
                <div>
                   <h3 className="text-2xl font-black">Liquidity & Bank Tracking</h3>
                   <p className="text-slate-400">Total liquid assets across all company accounts.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.bankAccounts.map(bank => (
                  <div key={bank.id} className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                     <p className="text-indigo-400 font-black text-[10px] uppercase mb-2 tracking-widest">{bank.bankName}</p>
                     <h4 className="text-2xl font-black">{currency} {bank.balance.toLocaleString()}</h4>
                     <p className="text-slate-500 text-xs mt-1 font-mono">{bank.accountNumber}</p>
                  </div>
                ))}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col justify-center items-center group cursor-pointer hover:border-indigo-500 transition-all">
                   <Plus className="text-indigo-500 group-hover:scale-110 transition-transform mb-1" />
                   <p className="text-xs font-bold text-slate-400 uppercase">View Other Accounts</p>
                </div>
             </div>
          </div>

          <div className="w-full md:w-80 space-y-6">
             <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-900/40">
                <p className="text-indigo-200 font-bold uppercase text-[10px] tracking-widest mb-2">Government Tax Ledger</p>
                <h2 className="text-4xl font-black mb-4">{currency} {financials.collectedTax.toLocaleString()}</h2>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden mb-4">
                   <div className="h-full bg-white w-3/4"></div>
                </div>
                <p className="text-xs text-indigo-100">Reserved from sales for tax remittance. Audit status: <span className="font-black">Ready</span></p>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-1">On-Hand Cash</p>
                   <p className="text-xl font-bold">{currency} {data.cashBalance.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center"><ArrowUpCircle size={20}/></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
