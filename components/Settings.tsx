
import React, { useState } from 'react';
import { ERPData, AppSettings } from '../types';
import { 
  User, Mail, Save, Server, Globe, ShieldCheck, RefreshCw, Percent, Building2
} from 'lucide-react';

interface Props {
  data: ERPData;
  onUpdate: React.Dispatch<React.SetStateAction<ERPData>>;
  t: (key: any) => string;
}

const Settings: React.FC<Props> = ({ data, onUpdate, t }) => {
  const [formData, setFormData] = useState<AppSettings>(data.settings);
  const [isSaving, setIsSaving] = useState(false);
  const isRTL = formData.language === 'ar';

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(prev => ({ ...prev, settings: formData }));
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${isRTL ? 'text-right' : ''}`}>
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h2 className="text-3xl font-black text-slate-800">{t('settings')}</h2>
          <p className="text-slate-500">Configure regional and system preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all active:scale-95"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          {isSaving ? 'Saving...' : t('save')}
        </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${isRTL ? 'md:grid-cols-[2fr_1fr]' : ''}`}>
        {/* Navigation Sidebar */}
        <div className={`space-y-2 ${isRTL ? 'md:order-2' : ''}`}>
          {['Profile & Branding', 'Regional & Finance', 'System & Database'].map((tab, i) => (
            <button 
              key={tab} 
              className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-3 rounded-xl text-sm font-bold transition-all ${i === 1 ? 'bg-white shadow-sm text-indigo-600 border' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={`md:col-span-2 space-y-6 ${isRTL ? 'md:order-1' : ''}`}>
          {/* Regional & Financial Settings */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className={`text-lg font-bold text-slate-800 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Globe className="text-indigo-600" size={20} />
              Financials & Localization
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('language')}</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-100"
                  value={formData.language}
                  onChange={e => setFormData({...formData, language: e.target.value as any})}
                >
                  <option value="en">English (US)</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('currency')}</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-center outline-none focus:ring-2 focus:ring-indigo-100"
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <Percent size={14} className="text-indigo-600" /> Default Sales Tax Rate (%)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-100"
                    value={formData.taxRate}
                    onChange={e => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">This VAT rate will be automatically applied to all new transactions in the POS terminal.</p>
              </div>
            </div>
          </section>

          {/* Branding Section */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className={`text-lg font-bold text-slate-800 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Building2 className="text-indigo-600" size={20} />
              Branding & Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Company Name</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100"
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Admin Name</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100"
                  value={formData.userName}
                  onChange={e => setFormData({...formData, userName: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Database Section */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className={`text-lg font-bold text-slate-800 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Server className="text-emerald-600" size={20} />
                Automation Server
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">
                <ShieldCheck size={12} /> Live Sync Active
              </div>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl font-mono text-[10px] text-indigo-300 border border-white/5 shadow-inner">
               mysql://muscat-node-01.om:3306/erp_live_production
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
