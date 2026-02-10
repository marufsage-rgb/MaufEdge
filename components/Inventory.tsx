
import React, { useState, useMemo, useRef } from 'react';
import { Product, ERPData, Sale, Supplier, StockLog } from '../types';
import { 
  Search, Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, 
  Package, Info, X, MapPin, Phone, Mail, Clock, 
  History, BarChart3, Tag, Settings2, SlidersHorizontal, Image as ImageIcon, Link as LinkIcon,
  Filter,
  Truck,
  Star,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Download,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Props {
  products: Product[];
  sales: Sale[];
  onUpdate: React.Dispatch<React.SetStateAction<ERPData>>;
  t: (key: any) => string;
  currency: string;
}

const Inventory: React.FC<Props> = ({ products, sales, onUpdate, t, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjusting, setIsAdjusting] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    minStockLevel: 0,
    unit: 'pcs',
    imageUrls: [''],
    primaryImageIndex: 0,
    supplierName: '',
    supplierContact: '',
    supplierEmail: '',
    supplierLeadTime: ''
  });

  const [adjustForm, setAdjustForm] = useState({
    amount: 1,
    type: 'add' as 'add' | 'remove',
    reason: ''
  });

  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  const suppliers = useMemo(() => {
    const list = products
      .map(p => p.supplier?.name)
      .filter((name): name is string => !!name);
    return ['All', ...new Set(list)];
  }, [products]);

  const fuzzyMatch = (text: string, query: string) => {
    const t = text.toLowerCase();
    const q = query.toLowerCase().trim();
    if (!q) return true;
    if (t.includes(q)) return true;
    let queryIdx = 0;
    for (let charIdx = 0; charIdx < t.length && queryIdx < q.length; charIdx++) {
      if (t[charIdx] === q[queryIdx]) queryIdx++;
    }
    return queryIdx === q.length;
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = fuzzyMatch(p.name, searchTerm) || fuzzyMatch(p.category, searchTerm);
      const matchesSupplier = filterSupplier === 'All' || p.supplier?.name === filterSupplier;
      return matchesSearch && matchesSupplier;
    });
  }, [products, searchTerm, filterSupplier]);

  const handleDownloadTemplate = () => {
    const headers = ["Name", "Category", "Price", "CostPrice", "Stock", "MinStockLevel", "Unit", "SupplierName", "SupplierContact", "SupplierEmail", "ImageURL1", "ImageURL2"];
    const rows = [
      ["Example Coffee", "Beverages", "45.00", "28.50", "100", "20", "kg", "Global Beans", "+123456", "beans@mail.com", "https://example.com/img1.jpg", ""],
      ["Eco Cups", "Packaging", "0.50", "0.15", "500", "100", "pcs", "EcoPack", "+987654", "eco@mail.com", "https://example.com/img2.jpg", ""]
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "marufedge_inventory_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCSV(text);
    };
    reader.readAsText(file);
  };

  const processCSV = (csvText: string) => {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) {
      setImportErrors(["CSV file is empty or missing data."]);
      return;
    }

    const headers = lines[0].split(",").map(h => h.trim());
    const newProducts: Product[] = [];
    const errors: string[] = [];
    let successCount = 0;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(",").map(v => v.trim());
      const pData: any = {};
      headers.forEach((h, index) => {
        pData[h] = values[index];
      });

      // Simple Validation
      if (!pData.Name) {
        errors.push(`Row ${i}: Missing Product Name`);
        continue;
      }

      const price = parseFloat(pData.Price);
      const costPrice = parseFloat(pData.CostPrice);
      const stock = parseInt(pData.Stock);
      const minStock = parseInt(pData.MinStockLevel);

      if (isNaN(price) || isNaN(costPrice) || isNaN(stock)) {
        errors.push(`Row ${i}: Invalid numerical values for Price, CostPrice, or Stock`);
        continue;
      }

      const imageUrls = [pData.ImageURL1, pData.ImageURL2].filter(url => url && url.startsWith('http'));

      const product: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: pData.Name,
        category: pData.Category || 'General',
        price: price,
        costPrice: costPrice,
        stock: stock,
        minStockLevel: isNaN(minStock) ? 10 : minStock,
        unit: pData.Unit || 'pcs',
        imageUrls: imageUrls,
        primaryImageIndex: 0,
        supplier: {
          name: pData.SupplierName || 'Unknown',
          contact: pData.SupplierContact || '',
          email: pData.SupplierEmail || '',
          leadTime: '7 days'
        },
        stockHistory: [{ timestamp: Date.now(), change: stock, type: 'restock', note: 'Bulk Import' }]
      };

      newProducts.push(product);
      successCount++;
    }

    if (newProducts.length > 0) {
      onUpdate(prev => ({ ...prev, products: [...prev.products, ...newProducts] }));
      setImportSuccess(successCount);
    }
    setImportErrors(errors);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanImageUrls = formData.imageUrls.filter(url => url.trim() !== '');
    const finalImageUrls = cleanImageUrls.length > 0 ? cleanImageUrls : [];
    
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      category: formData.category,
      price: formData.price,
      costPrice: formData.costPrice,
      stock: formData.stock,
      minStockLevel: formData.minStockLevel,
      unit: formData.unit,
      imageUrls: finalImageUrls,
      primaryImageIndex: formData.primaryImageIndex >= finalImageUrls.length ? 0 : formData.primaryImageIndex,
      supplier: {
        name: formData.supplierName,
        contact: formData.supplierContact,
        email: formData.supplierEmail,
        leadTime: formData.supplierLeadTime
      },
      stockHistory: [{ timestamp: Date.now(), change: formData.stock, type: 'restock', note: 'Initial Stock' }]
    };
    onUpdate(prev => ({ ...prev, products: [...prev.products, newProduct] }));
    setIsAdding(false);
    setFormData({ 
      name: '', category: '', price: 0, costPrice: 0, stock: 0, minStockLevel: 0, unit: 'pcs', 
      imageUrls: [''], primaryImageIndex: 0,
      supplierName: '', supplierContact: '', supplierEmail: '', supplierLeadTime: ''
    });
  };

  const handleStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdjusting) return;
    const change = adjustForm.type === 'add' ? adjustForm.amount : -adjustForm.amount;
    const newLog: StockLog = {
      timestamp: Date.now(),
      change: change,
      type: 'adjustment',
      note: adjustForm.reason || 'Manual adjustment'
    };
    onUpdate(prev => {
      const updatedProducts = prev.products.map(p => {
        if (p.id === isAdjusting.id) {
          const newStock = Math.max(0, p.stock + change);
          return { ...p, stock: newStock, stockHistory: [...(p.stockHistory || []), newLog] };
        }
        return p;
      });
      return { ...prev, products: updatedProducts };
    });
    setIsAdjusting(null);
    setAdjustForm({ amount: 1, type: 'add', reason: '' });
  };

  const productStats = useMemo(() => {
    if (!selectedProduct) return null;
    const productSales = sales.flatMap(s => s.items).filter(i => i.productId === selectedProduct.id);
    const totalSold = productSales.reduce((acc, i) => acc + i.quantity, 0);
    const revenue = productSales.reduce((acc, i) => acc + (i.quantity * i.price), 0);
    const avgSellingPrice = totalSold > 0 ? (revenue / totalSold) : selectedProduct.price;
    return { totalSold, revenue, avgSellingPrice };
  }, [selectedProduct, sales]);

  const handleAddImageUrl = () => {
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  };

  const handleRemoveImageUrl = (index: number) => {
    setFormData(prev => {
      const newUrls = prev.imageUrls.filter((_, i) => i !== index);
      let newPrimary = prev.primaryImageIndex;
      if (newPrimary >= newUrls.length) newPrimary = Math.max(0, newUrls.length - 1);
      return { ...prev, imageUrls: newUrls, primaryImageIndex: newPrimary };
    });
  };

  const handleImageUrlChange = (index: number, value: string) => {
    setFormData(prev => {
      const newUrls = [...prev.imageUrls];
      newUrls[index] = value;
      return { ...prev, imageUrls: newUrls };
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('search')}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X size={16} /></button>
            )}
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all shadow-sm text-sm appearance-none min-w-[160px] cursor-pointer"
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
            >
              {suppliers.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Suppliers' : s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsImporting(true)}
            className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all text-sm"
          >
            <FileUp size={18} />
            {t('bulk_import')}
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} />
            {t('add_product')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(product => (
          <div 
            key={product.id} 
            onClick={() => { setSelectedProduct(product); setCurrentGalleryIndex(product.primaryImageIndex); }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="w-full aspect-video bg-slate-50 relative overflow-hidden">
              {product.imageUrls && product.imageUrls.length > 0 ? (
                <img src={product.imageUrls[product.primaryImageIndex] || product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={48} /></div>
              )}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-indigo-600 rounded-lg shadow-sm" onClick={(e) => { e.stopPropagation(); setIsAdjusting(product); }}><SlidersHorizontal size={14} /></button>
                <button className="p-1.5 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-indigo-600 rounded-lg shadow-sm" onClick={(e) => e.stopPropagation()}><Edit2 size={14} /></button>
              </div>
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold rounded flex items-center gap-1">
                <ImageIcon size={10} /> {product.imageUrls?.length || 0}
              </div>
              {product.supplier && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-indigo-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase rounded shadow-sm flex items-center gap-1">
                  <Truck size={10} /> {product.supplier.name}
                </div>
              )}
            </div>
            <div className="p-6 pt-4">
              <h4 className="font-bold text-slate-800 mb-1 line-clamp-1">{product.name}</h4>
              <p className="text-[10px] font-black text-indigo-600 uppercase mb-4 tracking-wider">{product.category}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Stock</p>
                  <p className={`text-lg font-bold ${product.stock <= product.minStockLevel ? 'text-rose-600' : 'text-slate-800'}`}>{product.stock} <span className="text-sm font-medium text-slate-400">{product.unit}</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Price</p>
                  <p className="text-lg font-bold text-slate-800">{currency} {product.price.toFixed(3)}</p>
                </div>
              </div>
              {product.stock <= product.minStockLevel && (
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md w-fit"><ArrowDownRight size={14} /> LOW STOCK</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Import Modal */}
      {isImporting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Bulk Import</h3>
                <p className="text-sm text-slate-500">Upload your inventory via CSV file.</p>
              </div>
              <button onClick={() => { setIsImporting(false); setImportErrors([]); setImportSuccess(0); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp size={28} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800">Click to upload CSV</p>
                  <p className="text-xs text-slate-400">or drag and drop your file here</p>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
              </div>

              <button 
                onClick={handleDownloadTemplate}
                className="w-full py-4 border border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Download size={18} />
                Download CSV Template
              </button>

              {/* Status Section */}
              {(importSuccess > 0 || importErrors.length > 0) && (
                <div className="space-y-4 pt-4">
                  {importSuccess > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2">
                      <CheckCircle2 size={20} />
                      <p className="text-sm font-bold">Successfully imported {importSuccess} products!</p>
                    </div>
                  )}
                  {importErrors.length > 0 && (
                    <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 max-h-[150px] overflow-y-auto">
                      <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                        <AlertCircle size={18} />
                        Import Issues Found:
                      </div>
                      <ul className="text-xs space-y-1 ml-6 list-disc opacity-80">
                        {importErrors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => { setIsImporting(false); setImportErrors([]); setImportSuccess(0); }}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 overflow-hidden">
                   <Package size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{selectedProduct.name}</h3>
                  <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{selectedProduct.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-3 bg-white text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm border border-slate-100 transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8">
              <div className="space-y-4">
                <div className="relative w-full h-[400px] rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group">
                  {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 ? (
                    <>
                      <img src={selectedProduct.imageUrls[currentGalleryIndex]} className="w-full h-full object-contain" alt={selectedProduct.name} />
                      {selectedProduct.imageUrls.length > 1 && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); setCurrentGalleryIndex(prev => prev === 0 ? selectedProduct.imageUrls.length - 1 : prev - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm text-slate-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft size={24} /></button>
                          <button onClick={(e) => { e.stopPropagation(); setCurrentGalleryIndex(prev => prev === selectedProduct.imageUrls.length - 1 ? 0 : prev + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm text-slate-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={24} /></button>
                        </>
                      )}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {selectedProduct.imageUrls.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all ${i === currentGalleryIndex ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-300'}`}></div>))}
                      </div>
                      {currentGalleryIndex === selectedProduct.primaryImageIndex && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg shadow-lg flex items-center gap-1"><Star size={12} className="fill-white" /> Primary Image</div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={80} /></div>
                  )}
                </div>
                {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {selectedProduct.imageUrls.map((url, i) => (
                      <button key={i} onClick={() => setCurrentGalleryIndex(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${i === currentGalleryIndex ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-100 hover:border-slate-300'}`}><img src={url} className="w-full h-full object-cover" /></button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Current Stock</p>
                  <p className="text-3xl font-black text-slate-800">{selectedProduct.stock} <span className="text-sm font-medium">{selectedProduct.unit}</span></p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Avg. Sale Price</p>
                  <p className="text-3xl font-black text-emerald-600">{currency} {productStats?.avgSellingPrice.toFixed(3)}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Sold</p>
                  <p className="text-3xl font-black text-indigo-600">{productStats?.totalSold}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Revenue</p>
                  <p className="text-3xl font-black text-slate-800">{currency} {productStats?.revenue.toFixed(3)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Tag className="text-indigo-600" size={20} /> Supplier Details</h4>
                  {selectedProduct.supplier ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-slate-800">{selectedProduct.supplier.name}</p>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg uppercase">Primary Vendor</span>
                      </div>
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-slate-600"><Phone size={16} className="text-slate-400" /><span className="text-sm">{selectedProduct.supplier.contact}</span></div>
                        <div className="flex items-center gap-3 text-slate-600"><Mail size={16} className="text-slate-400" /><span className="text-sm">{selectedProduct.supplier.email}</span></div>
                        <div className="flex items-center gap-3 text-slate-600"><Clock size={16} className="text-slate-400" /><span className="text-sm font-semibold">Lead Time: {selectedProduct.supplier.leadTime}</span></div>
                      </div>
                    </div>
                  ) : (<div className="bg-slate-50 rounded-3xl p-8 text-center border border-dashed border-slate-200 text-slate-400 italic">No supplier information available.</div>)}
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2"><History className="text-indigo-600" size={20} /> Stock History</h4>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 overflow-hidden">
                    <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                      {selectedProduct.stockHistory?.slice().reverse().map((log, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className={`p-2 rounded-xl mt-1 ${log.change > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{log.change > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-sm font-bold text-slate-800 capitalize">{log.type === 'adjustment' ? 'Stock Adjustment' : (log.type === 'restock' ? 'Restock' : 'Sale')}{log.change > 0 ? ' (In)' : ' (Out)'}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.timestamp).toLocaleDateString()}</p>
                            </div>
                            <p className="text-xs text-slate-500">{log.note || `Adjusted stock by ${log.change} ${selectedProduct.unit}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsAdjusting(selectedProduct)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"><SlidersHorizontal size={18} /> Adjust Stock</button>
              <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors">Edit Product</button>
              <button onClick={() => { setIsAdjusting(selectedProduct); setAdjustForm(prev => ({ ...prev, type: 'add', reason: 'Manual Restock' })); }} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg">Restock Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800">New Inventory Item</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={16} /> Product Media Gallery</h4>
                    <button type="button" onClick={handleAddImageUrl} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"><Plus size={14} /> Add Another URL</button>
                  </div>
                  <div className="space-y-4">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 group">
                        <div className="w-full sm:w-24 aspect-square bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {url ? <img src={url} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-200" size={24} />}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input placeholder="Image URL (Unsplash, etc.)" className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 text-sm" value={url} onChange={e => handleImageUrlChange(index, e.target.value)} /></div>
                          <div className="flex items-center justify-between">
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, primaryImageIndex: index }))} className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${formData.primaryImageIndex === index ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'}`}><Star size={14} className={formData.primaryImageIndex === index ? 'fill-amber-500' : ''} />{formData.primaryImageIndex === index ? 'Primary Image' : 'Set as Primary'}</button>
                            {formData.imageUrls.length > 1 && (<button type="button" onClick={() => handleRemoveImageUrl(index)} className="text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Trash2 size={14} /> Remove</button>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2"><h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4"><Info size={16} /> Essential Information</h4></div>
                <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Category</label><input required placeholder="Beverages" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Unit</label><input required placeholder="pcs, kg" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Initial Stock</label><input type="number" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Cost Price</label><input type="number" step="0.001" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Selling Price</label><input type="number" step="0.001" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></div>
                <div className="md:col-span-2 pt-4"><h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4"><Truck size={16} /> Procurement Details</h4></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Supplier Name</label><input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Contact Phone</label><input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.supplierContact} onChange={e => setFormData({...formData, supplierContact: e.target.value})} /></div>
              </div>
            </form>
            <div className="p-8 bg-slate-50 border-t border-slate-100"><button type="submit" onClick={handleAddProduct} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">Create Product Entry</button></div>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {isAdjusting && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Adjust Stock Level</h3>
              <button onClick={() => setIsAdjusting(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleStockAdjustment} className="p-6 space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl mb-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-100">
                   {isAdjusting.imageUrls && isAdjusting.imageUrls.length > 0 ? <img src={isAdjusting.imageUrls[isAdjusting.primaryImageIndex]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={20} /></div>}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Product</p>
                  <p className="font-bold text-slate-800 leading-tight">{isAdjusting.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Current: {isAdjusting.stock} {isAdjusting.unit}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl"><button type="button" onClick={() => setAdjustForm({...adjustForm, type: 'add'})} className={`py-2 rounded-lg text-sm font-bold transition-all ${adjustForm.type === 'add' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Add Stock</button><button type="button" onClick={() => setAdjustForm({...adjustForm, type: 'remove'})} className={`py-2 rounded-lg text-sm font-bold transition-all ${adjustForm.type === 'remove' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}>Remove Stock</button></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Quantity ({isAdjusting.unit})</label><input type="number" required min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={adjustForm.amount} onChange={e => setAdjustForm({...adjustForm, amount: Number(e.target.value)})} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Reason / Note</label><textarea required placeholder="e.g. Damage disposal, New shipment" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none min-h-[100px] text-sm" value={adjustForm.reason} onChange={e => setAdjustForm({...adjustForm, reason: e.target.value})} /></div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-xl mt-4 transition-all">Confirm Adjustment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
