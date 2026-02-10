
import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import Logo from './Logo.js';

const InvoiceBill = ({ sale, settings, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <CheckCircle2 size={18} /> Success
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-8 flex-1 overflow-auto text-sm" id="printable-area">
          <div className="flex justify-between items-start mb-8">
            <Logo size={40} />
            <div className="text-right">
              <h2 className="font-black text-xl">INVOICE</h2>
              <p className="text-slate-400">#{sale.id}</p>
            </div>
          </div>
          <div className="mb-6">
            <p className="font-bold">{settings.companyName}</p>
            <p className="text-slate-500">Date: {new Date(sale.timestamp).toLocaleDateString()}</p>
          </div>
          <table className="w-full mb-6">
            <thead className="border-b">
              <tr><th className="text-left py-2">Item</th><th className="text-right py-2">Total</th></tr>
            </thead>
            <tbody>
              {sale.items.map(i => (
                <tr key={i.productId}><td className="py-2">{i.name} x{i.quantity}</td><td className="text-right">{settings.currency} {i.price * i.quantity}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="border-t pt-4 text-right space-y-1">
            <p>Total: <span className="font-black text-lg">{settings.currency} {sale.totalAmount}</span></p>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3">
          <button onClick={() => window.print()} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Printer size={18} /> Print</button>
          <button onClick={onClose} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold">New Sale</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBill;
