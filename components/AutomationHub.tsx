
import React, { useState, useEffect } from 'react';
import { GeminiERPService } from '../services/geminiService';
import { ERPData } from '../types';
import { 
  Bot, Sparkles, Zap, BrainCircuit, RefreshCcw, Info, 
  AlertCircle, CheckCircle2, UserCheck, TrendingUp, 
  ArrowRight, Star
} from 'lucide-react';

interface Props {
  data: ERPData;
  t: (key: any) => string;
}

const AutomationHub: React.FC<Props> = ({ data, t }) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [customerIntel, setCustomerIntel] = useState<{segments: any[], upsellOpportunities: any[]}>({segments: [], upsellOpportunities: []});
  const [prediction, setPrediction] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const gemini = new GeminiERPService();

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const [newInsights, newPrediction, newIntel] = await Promise.all([
        gemini.getInsights(data),
        gemini.predictNextMonthSales(data),
        gemini.getCustomerIntelligence(data)
      ]);
      setInsights(newInsights);
      setPrediction(newPrediction);
      setCustomerIntel(newIntel);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, [data]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/10">
                <Bot size={44} />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-1">{t('ai')} Hub</h2>
                <p className="text-slate-400 text-lg">Predicting behavior, automating inventory, and growing revenue.</p>
              </div>
            </div>
            <button 
              disabled={loading}
              onClick={fetchAIInsights}
              className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
            >
              {loading ? <RefreshCcw className="animate-spin" size={24} /> : <Zap size={24} className="text-indigo-600" />}
              {loading ? "Analyzing Enterprise Data..." : "Run AI Diagnostic"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/10 transition-colors">
              <h4 className="text-indigo-400 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={16} /> 30-Day Growth Forecast
              </h4>
              <p className="text-2xl font-medium leading-relaxed">
                {prediction || "Calculating projections based on historical patterns..."}
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/10 transition-colors">
               <h4 className="text-emerald-400 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                <UserCheck size={16} /> Behavioral Snapshot
              </h4>
              <div className="space-y-3">
                {customerIntel.segments.length > 0 ? customerIntel.segments.slice(0, 2).map((seg, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-100">{seg.name}</p>
                      <p className="text-xs text-slate-400">{seg.description}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">{seg.potentialValue}</span>
                  </div>
                )) : <p className="text-slate-500 italic">No patterns detected yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 px-2">
            <Star className="text-amber-500 fill-amber-500" size={24} />
            Upselling Opportunities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customerIntel.upsellOpportunities.length > 0 ? customerIntel.upsellOpportunities.map((op, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-indigo-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Customer</p>
                    <h4 className="text-lg font-black text-slate-800">{op.customerName || 'Loyal Patron'}</h4>
                  </div>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Zap size={18} />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                  <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Recommended</p>
                  <p className="font-bold text-slate-800">{op.recommendedProduct}</p>
                </div>
                <p className="text-sm text-slate-500 italic line-clamp-2">"{op.reason}"</p>
                <button className="mt-5 w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-colors">
                  Create Quote <ArrowRight size={16} />
                </button>
              </div>
            )) : (
              <div className="col-span-2 text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <BrainCircuit size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-medium px-10">Run diagnostic to identify customers likely to purchase complementary items.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 px-2">
            <Zap className="text-indigo-600" size={24} />
            Strategic Insights
          </h3>
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-10 transition-transform group-hover:scale-110 
                  ${insight.type === 'warning' ? 'bg-rose-500' : insight.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                
                <div className={`mb-4 w-10 h-10 rounded-xl flex items-center justify-center
                  ${insight.type === 'warning' ? 'bg-rose-50 text-rose-600' : insight.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {insight.type === 'warning' ? <AlertCircle size={20} /> : insight.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2">{insight.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationHub;
