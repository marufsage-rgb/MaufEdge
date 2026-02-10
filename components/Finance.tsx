
import React, { useState, useMemo } from 'react';
import { ERPData, Transaction, BankAccount } from '../types';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Plus, Download, Filter, 
  Search, X, Database, CreditCard, Building2, Send, ShieldCheck 
} from 'lucide-react';

interface Props {
  data: ERPData;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onUpdate: React.Dispatch<React.SetStateAction<ERPData>>;
  t: (key: any) => string;
}

const Finance: React.FC<Props> = ({ data, onAddTransaction, onUpdate, t }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [txForm, setTxForm] = useState<Omit<Transaction, 'id' | 'timestamp'>>({
    type: 'expense',
    category: 'General',
    amount: 0,
    description: '',
    bankAccountId: ''
  });

  const currency = data.settings.currency;

  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', type: 'current' as any, balance: 0 });

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(tx => 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice().reverse();
  }, [data.transactions, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction(txForm);
    setIsAdding(false);
    setTxForm({ type: 'expense', category: 'General', amount: 0, description: '', bankAccountId: '' });
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    const newBank: BankAccount = {
      id: Math.random().toString(36).substr(2, 9),
      ...bankForm
    };
    onUpdate(prev => ({ ...prev, bankAccounts: [...prev.bankAccounts, newBank] }));
    setIsAddingBank(false);
    setBankForm({ bankName: '', accountNumber: '', type: 'current', balance: 0 });
  };

  const totalLiquidity = data.cashBalance + data.bankAccounts.reduce((acc, b) => acc + b.balance, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Wallet Card */}
        <div className="lg:col-span-2 bg-indigo-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-100 h-full flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                 <p className="text-indigo-200 font-bold uppercase text-[10px] tracking-widest mb-2">Total Corporate Liquidity</p>
                 <h2 className="text-5xl font-black tracking-tight">{currency} {totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
              </div>
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20"><Wallet size={32}/></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-indigo-200 text-[10px] font-black uppercase mb-1">Physical Cash</p>
                  <p className="text-2xl font-black">{currency} {data.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
               </div>
               <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-indigo-200 text-[10px] font-black uppercase mb-1">Bank Assets</p>
                  <p className="text-2xl font-black">{currency} {data.bankAccounts.reduce((acc, b) => acc + b.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
               </div>
            </div>
          </div>
          <div className="relative z-10 flex gap-3 mt-10">
             <button onClick={() => setIsAdding(true)} className="flex-1 bg-white text-indigo-700 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"><Plus size={18}/> Record Entry</button>
             <button onClick={() => setIsAddingBank(true)} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-95"><Building2 size={18}/> Link Bank</button>
          </div>
        </div>

        {/* Bank Accounts List */}
        <div className="space-y-4">
           <h3 className="text-xl font-bold text-slate-800 px-2 flex items-center gap-2"><CreditCard size={20} className="text-indigo-600"/> Bank Accounts</h3>
           <div className="space-y-3">
              {data.bankAccounts.map(bank => (
                <div key={bank.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:text-indigo-600 transition-colors"><Building2 size={24}/></div>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">Verified</span>
                   </div>
                   <h4 className="font-bold text-slate-800">{bank.bankName}</h4>
                   <p className="text-xs text-slate-400 font-medium font-mono">{bank.accountNumber}</p>
                   <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{bank.type}</p>
                      <p className="text-xl font-black text-slate-800">{currency} {bank.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                   </div>
                </div>
              ))}
              <button onClick={() => setIsAddingBank(true)} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-600 transition-all flex flex-col items-center gap-2">
                 <Plus size={24}/>
                 Add Financial Account
              </button>
           </div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black text-slate-800">Business Ledger</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-lg">Audit Ready</span>
           </div>
           <div className="flex flex-1 max-w-md gap-3">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input type="text" placeholder="Search entries..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"><Filter size={20}/></button>
           </div>
        </div>
        <div className="divide-y divide-slate-50 min-h-[400px]">
           {filteredTransactions.map(tx => (
             <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-5">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {tx.type === 'income' ? <ArrowUpRight size={28}/> : <ArrowDownRight size={28}/>}
                   </div>
                   <div>
                      <h4 className="text-lg font-bold text-slate-800">{tx.description}</h4>
                      <div className="flex items-center gap-3 mt-1">
                         <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${tx.category === 'Salary' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>{tx.category}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                   </div>
                </div>
                <div className="text-right">
                   <p className={`text-2xl font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                   </p>
                   {tx.bankAccountId && <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">Direct Bank Deposit</p>}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Transaction Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Financial Entry</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                 <button type="button" onClick={() => setTxForm({...txForm, type: 'income'})} className={`py-2 rounded-lg text-sm font-bold ${txForm.type === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Income</button>
                 <button type="button" onClick={() => setTxForm({...txForm, type: 'expense'})} className={`py-2 rounded-lg text-sm font-bold ${txForm.type === 'expense' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}>Expense</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Amount</label>
                    <input type="number" step="0.01" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: Number(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value as any})}>
                       <option>General</option>
                       <option>Rent</option>
                       <option>Utilities</option>
                       <option>Marketing</option>
                       <option>Stock</option>
                       <option>Tax</option>
                       <option>Bank Deposit</option>
                    </select>
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                 <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 mt-4 transition-all active:scale-95">Verify & Post Entry</button>
            </form>
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {isAddingBank && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Link Bank Account</h3>
              <button onClick={() => setIsAddingBank(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddBank} className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Financial Institution</label>
                  <input required placeholder="e.g. Standard Chartered, HSBC" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Account Number</label>
                  <input required placeholder="xxxx-xxxx-xxxx" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Opening Balance</label>
                     <input type="number" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={bankForm.balance} onChange={e => setBankForm({...bankForm, balance: Number(e.target.value)})} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Account Type</label>
                     <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={bankForm.type} onChange={e => setBankForm({...bankForm, type: e.target.value as any})}>
                        <option value="current">Current</option>
                        <option value="savings">Savings</option>
                        <option value="company-credit">Credit</option>
                     </select>
                  </div>
               </div>
               <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl mt-4 transition-all active:scale-95">Initiate Link</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
