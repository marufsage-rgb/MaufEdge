
import React from 'react';
import { Package, Plus } from 'lucide-react';

const Inventory = ({ products, t, currency }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Stock List</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold"><Plus size={18}/> Add Product</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold">{p.name}</h4>
            <p className="text-xs text-slate-500">{p.category}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="font-bold text-indigo-600">{currency} {p.price}</span>
              <span className={`text-xs px-2 py-1 rounded ${p.stock < 5 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50'}`}>Stock: {p.stock}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
