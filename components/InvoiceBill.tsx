
import React from 'react';
import { Sale, AppSettings } from '../types';
import Logo from './Logo';
// Added ShieldCheck to the imported icons from lucide-react
import { Printer, X, Download, Share2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  sale: Sale;
  settings: AppSettings;
  onClose: () => void;
}

const InvoiceBill: React.FC<Props> = ({ sale, settings, onClose }) => {
  const currency = settings.currency;
  const isRTL = settings.language === 'ar';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto pt-10 pb-10">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col print:shadow-none print:rounded-none print:max-w-none print:p-0">
        
        {/* Header Actions - Hidden on Print */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <span className="font-bold text-slate-800">Sale Completed Successfully</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 px-4 font-bold text-sm shadow-lg shadow-indigo-100"
            >
              <Printer size={18} /> Print Bill
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 bg-white text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200 shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* The Actual Invoice Content */}
        <div className="p-10 flex-1 bg-white print:p-0" id="invoice-bill">
          {/* Branding & Header */}
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-4">
              <Logo size={60} />
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none">
                  <span className="text-indigo-600">MarufEdge</span><br/>
                  <span className="text-orange-500 text-lg uppercase tracking-wider">ProMedia</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Oman Corporate Edition</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">INVOICE</h2>
              <p className="text-sm font-bold text-indigo-600 mt-1">#{sale.id}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{new Date(sale.timestamp).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12 border-y border-slate-100 py-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Issued By</p>
              <p className="font-bold text-slate-800">{settings.companyName}</p>
              <p className="text-sm text-slate-500 mt-1">Muscat, Sultanate of Oman</p>
              <p className="text-sm text-slate-500">VAT Reg: OM-12345-PRO</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bill To</p>
              <p className="font-bold text-slate-800">{sale.customerName || "Walk-in Customer"}</p>
              <p className="text-sm text-slate-500 mt-1">Payment Method: <span className="uppercase font-bold text-slate-700">{sale.paymentMethod}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Qty</th>
                <th className="py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Price</th>
                <th className="py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-5">
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Code: PRD-{item.productId.slice(0,4)}</p>
                  </td>
                  <td className="py-5 text-center font-medium text-slate-600">{item.quantity}</td>
                  <td className="py-5 text-right font-medium text-slate-600">{currency} {item.price.toFixed(3)}</td>
                  <td className="py-5 text-right font-bold text-slate-800">{currency} {(item.quantity * item.price).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Subtotal</span>
                <span className="font-bold text-slate-700">{currency} {sale.subtotal.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold uppercase tracking-widest">VAT ({settings.taxRate}%)</span>
                <span className="font-bold text-slate-700">{currency} {sale.taxAmount.toFixed(3)}</span>
              </div>
              <div className="h-[1px] bg-slate-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">Total Amount</span>
                <span className="text-2xl font-black text-indigo-600">{currency} {sale.totalAmount.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-10 border-t border-slate-100 text-center">
            <p className="text-sm font-bold text-slate-800 mb-1">Thank you for your business!</p>
            <p className="text-xs text-slate-400">This is a computer-generated invoice and does not require a signature.</p>
            <div className="mt-8 flex justify-center gap-6 grayscale opacity-30">
               <Share2 size={16} />
               <Download size={16} />
               <ShieldCheck size={16} />
            </div>
          </div>
        </div>

        {/* Bottom Actions - Hidden on Print */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 print:hidden">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-95"
          >
            New Sale
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-bill, #invoice-bill * {
            visibility: visible;
          }
          #invoice-bill {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceBill;
