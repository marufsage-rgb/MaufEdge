
export interface Supplier {
  name: string;
  contact: string;
  email: string;
  leadTime: string;
}

export interface StockLog {
  timestamp: number;
  change: number;
  type: 'sale' | 'restock' | 'adjustment';
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockLevel: number;
  unit: string;
  imageUrls: string[]; 
  primaryImageIndex: number; 
  supplier?: Supplier;
  stockHistory?: StockLog[];
}

export interface Staff {
  id: string;
  name: string;
  position: string;
  salary: number;
  joiningDate: number;
  status: 'active' | 'on-leave' | 'terminated';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  type: 'current' | 'savings' | 'company-credit';
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'online';
  customerName?: string;
}

export interface Transaction {
  id: string;
  timestamp: number;
  type: 'income' | 'expense';
  category: 'General' | 'Rent' | 'Salary' | 'Utilities' | 'Tax' | 'Stock' | 'Marketing' | 'Bank Deposit' | 'Sales';
  amount: number;
  description: string;
  bankAccountId?: string;
}

export interface AppSettings {
  companyName: string;
  userEmail: string;
  userName: string;
  currency: string;
  language: 'en' | 'ar'; // Added language support
  taxRate: number;
  sqlServerStatus: 'connected' | 'disconnected' | 'syncing';
  lastBackup: number;
}

export interface ERPData {
  products: Product[];
  sales: Sale[];
  transactions: Transaction[];
  staff: Staff[];
  bankAccounts: BankAccount[];
  cashBalance: number;
  settings: AppSettings;
}
