
import React, { useState } from 'react';
import { ERPData, Staff } from '../types';
import { Users, Plus, UserPlus, CreditCard, Calendar, Trash2, Search, X, CheckCircle, Clock } from 'lucide-react';

interface Props {
  data: ERPData;
  onUpdate: React.Dispatch<React.SetStateAction<ERPData>>;
  t: (key: any) => string;
}

const HR: React.FC<Props> = ({ data, onUpdate, t }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', position: '', salary: 0 });

  const currency = data.settings.currency;

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: Staff = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      position: formData.position,
      salary: Number(formData.salary),
      status: 'active',
      joiningDate: Date.now()
    };
    onUpdate(prev => ({ ...prev, staff: [...prev.staff, newStaff] }));
    setIsAdding(false);
    setFormData({ name: '', position: '', salary: 0 });
  };

  const processSalary = (staff: Staff) => {
    const confirm = window.confirm(`Process monthly salary payment of ${currency} ${staff.salary} to ${staff.name}?`);
    if (confirm) {
      onUpdate(prev => ({
        ...prev,
        cashBalance: prev.cashBalance - staff.salary,
        transactions: [...prev.transactions, {
          id: `salary-${staff.id}-${Date.now()}`,
          timestamp: Date.now(),
          type: 'expense',
          category: 'Salary',
          amount: staff.salary,
          description: `Salary payout for ${staff.name} - ${new Date().toLocaleString('default', { month: 'long' })}`
        }]
      }));
      alert("Salary successfully processed and recorded in ledger.");
    }
  };

  const filteredStaff = data.staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Employment & HR</h2>
          <p className="text-slate-500">Manage employee payroll, salary payouts, and staff records.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
        >
          <UserPlus size={20} />
          Onboard New Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={24}/></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Total Headcount</p><h4 className="text-2xl font-black text-slate-800">{data.staff.length} Employees</h4></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CreditCard size={24}/></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Monthly Liability</p><h4 className="text-2xl font-black text-slate-800">{currency} {data.staff.reduce((acc, s) => acc + s.salary, 0).toLocaleString()}</h4></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Calendar size={24}/></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Next Payroll Run</p><h4 className="text-2xl font-black text-slate-800">01 {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('default', { month: 'short' })}</h4></div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h3 className="text-xl font-bold text-slate-800">Active Staff Registry</h3>
           <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search staff..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
        </div>
        <div className="divide-y divide-slate-50">
           {filteredStaff.map(member => (
             <div key={member.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg border-2 border-white shadow-sm uppercase">{member.name.charAt(0)}</div>
                   <div>
                      <h4 className="text-lg font-bold text-slate-800">{member.name}</h4>
                      <p className="text-sm text-indigo-600 font-bold uppercase tracking-widest">{member.position}</p>
                   </div>
                </div>
                <div className="flex flex-wrap items-center gap-8">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Monthly Salary</p>
                      <p className="font-black text-slate-800">{currency} {member.salary.toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg">Active Employment</span>
                   </div>
                   <button 
                     onClick={() => processSalary(member)}
                     className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all flex items-center gap-2"
                   >
                     <CreditCard size={16}/> Process Salary
                   </button>
                </div>
             </div>
           ))}
           {filteredStaff.length === 0 && (
             <div className="py-20 text-center text-slate-400 font-medium">No staff members found.</div>
           )}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Onboard New Employee</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Position / Designation</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Base Monthly Salary ({currency})</label>
                <input type="number" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 mt-4 transition-all">Confirm Onboarding</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HR;
