
import React, { useState } from 'react';
import { Product, Sale, SaleItem } from '../types';
import { Search, ShoppingBag, Trash2, CheckCircle, User, CreditCard, DollarSign, Percent, X, Receipt, ShieldCheck } from 'lucide-react';

interface Props {
  products: Product[];
  onCompleteSale: (sale: Sale) => void;
  t: (key: any) => string;
  currency: string;
}

const SalesPOS: React.FC<Props> = ({ products, onCompleteSale, t, currency }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [taxRate, setTaxRate] = useState(5);
  const [showTaxEdit, setShowTaxEdit] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return alert("Out of stock!");
    
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.price }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.productId !== id));
  };

  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleCompleteSale = () => {
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: Date.now(),
      items: cart,
      subtotal,
      taxAmount,
      totalAmount: grandTotal,
      paymentMethod,
      customerName
    };

    onCompleteSale(newSale);
    setCart([]);
    setCustomerName('');
    setIsConfirming(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-w-7xl mx-auto">
      {/* Product Selection */}
      <div className="lg:col-span-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={t('search')}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 scrollbar-hide">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left flex flex-col items-center text-center group active:scale-95"
            >
              <div className="w-full aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-200 transition-colors overflow-hidden">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <img src={product.imageUrls[product.primaryImageIndex] || product.imageUrls[0]} className="w-full h-full object-cover" alt={product.name} />
                ) : (
                  <ShoppingBag size={40} />
                )}
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1 truncate w-full">{product.name}</h4>
              <p className="text-indigo-600 font-bold text-lg">{currency} {product.price.toFixed(3)}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Stock: {product.stock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout (No structural changes needed) */}
      <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col sticky top-20 h-fit max-h-[calc(100vh-120px)] overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" />
            Current Order
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length > 0 ? cart.map(item => (
            <div key={item.productId} className="flex items-center justify-between group">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{item.quantity} x {currency} {item.price.toFixed(3)}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold text-slate-800">{currency} {(item.quantity * item.price).toFixed(3)}</p>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                <ShoppingBag size={32} />
              </div>
              <p className="text-slate-400 font-medium">Cart is empty</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <User size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Customer Name (Optional)" 
                className="bg-transparent border-none text-sm outline-none flex-1"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: DollarSign },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'online', label: 'Online', icon: CheckCircle },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${paymentMethod === m.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                >
                  <m.icon size={16} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>{currency} {subtotal.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 text-sm group">
              <div className="flex items-center gap-1">
                <span>Tax ({taxRate}%)</span>
                <button 
                  onClick={() => setShowTaxEdit(true)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded transition-all"
                >
                  <Percent size={12} />
                </button>
              </div>
              <span>{currency} {taxAmount.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-slate-800 text-2xl font-black pt-2">
              <span>Total</span>
              <span>{currency} {grandTotal.toFixed(3)}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={() => setIsConfirming(true)}
            className="w-full py-4 bg-indigo-600 disabled:bg-slate-300 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            Review & Checkout
          </button>
        </div>
      </div>

      {/* Checkout Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
            <div className="p-8 pb-4 text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
                <ShieldCheck size={44} strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-2">Final Confirmation</h3>
              <p className="text-slate-500">Please review the order details before completing the payment processing.</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Customer</p>
                  <p className="font-bold text-slate-800">{customerName || 'Walk-in Customer'}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Payment</p>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase text-xs">
                     {paymentMethod === 'cash' ? <DollarSign size={14} /> : paymentMethod === 'card' ? <CreditCard size={14} /> : <CheckCircle size={14} />}
                     {paymentMethod}
                  </div>
                </div>
                <div className="h-[1px] bg-slate-200 w-full"></div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-semibold">{currency} {subtotal.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tax ({taxRate}%)</span>
                    <span className="font-semibold">{currency} {taxAmount.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xl font-black text-slate-800">Total Due</p>
                    <p className="text-3xl font-black text-indigo-600">{currency} {grandTotal.toFixed(3)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-200"
                >
                  Cancel & Edit
                </button>
                <button 
                  onClick={handleCompleteSale}
                  className="flex-2 flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Confirm & Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Edit Modal Overlay */}
      {showTaxEdit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-800">Set Tax Rate</h4>
              <button onClick={() => setShowTaxEdit(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Percent size={20} className="text-indigo-600" />
              <input 
                type="number" 
                className="bg-transparent border-none outline-none flex-1 font-bold text-lg"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>
            <button 
              onClick={() => setShowTaxEdit(false)}
              className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Update Tax
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPOS;
