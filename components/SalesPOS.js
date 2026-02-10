
import React, { useState } from 'react';
import { ShoppingBag, Search, Trash2, CreditCard } from 'lucide-react';
import InvoiceBill from './InvoiceBill.js';

const SalesPOS = ({ products, onCompleteSale, t, currency, settings }) => {
  const [cart, setCart] = useState([]);
  const [completedSale, setCompletedSale] = useState(null);

  const addToCart = (p) => {
    setCart(prev => {
      const exists = prev.find(i => i.productId === p.id);
      if (exists) return prev.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: p.id, name: p.name, quantity: 1, price: p.price }];
    });
  };

  const handleCheckout = () => {
    const subtotal = cart.reduce((a, i) => a + (i.price * i.quantity), 0);
    const tax = (subtotal * settings.taxRate) / 100;
    const sale = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: Date.now(),
      items: cart,
      subtotal,
      taxAmount: tax,
      totalAmount: subtotal + tax,
      paymentMethod: 'cash'
    };
    onCompleteSale(sale);
    setCompletedSale(sale);
    setCart([]);
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {products.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-indigo-500">
              <h4 className="font-bold">{p.name}</h4>
              <p className="text-indigo-600">{currency} {p.price}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="col-span-4 bg-white p-6 rounded-2xl border border-slate-200 h-fit">
        <h3 className="font-bold mb-4 flex items-center gap-2"><ShoppingBag /> Cart</h3>
        {cart.map(i => (
          <div key={i.productId} className="flex justify-between text-sm mb-2">
            <span>{i.name} x{i.quantity}</span>
            <span>{currency} {i.price * i.quantity}</span>
          </div>
        ))}
        <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-bold">Checkout</button>
      </div>
      {completedSale && React.createElement(InvoiceBill, { sale: completedSale, settings, onClose: () => setCompletedSale(null) })}
    </div>
  );
};

export default SalesPOS;
