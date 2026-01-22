import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { AppRoute, Expense, Donation } from './types';
import { GeminiService } from './services/geminiService';
import { StorageService } from './services/storageService';
import { UPI_ID, CURRENCY, EXPENSE_CATEGORIES, PAYEE_NAME } from './constants';

// --- Context & Hooks ---

// Global Data Hook for Real-time Updates
const useCharityData = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const fetchData = () => {
    setExpenses(StorageService.getExpenses());
    setDonations(StorageService.getDonations());
  };

  useEffect(() => {
    fetchData(); // Initial load
    
    // Listen for local updates
    window.addEventListener('charity-data-change', fetchData);
    // Listen for cross-tab updates
    window.addEventListener('storage', fetchData);
    // Listen for custom notifications
    const handleNotify = (e: any) => {
        setNotification(e.detail);
        setTimeout(() => setNotification(null), 4000);
    };
    window.addEventListener('app-notification', handleNotify);

    return () => {
      window.removeEventListener('charity-data-change', fetchData);
      window.removeEventListener('storage', fetchData);
      window.removeEventListener('app-notification', handleNotify);
    };
  }, []);

  return { expenses, donations, notification };
};

const notify = (message: string, type: 'success' | 'info' = 'success') => {
    window.dispatchEvent(new CustomEvent('app-notification', { detail: { message, type } }));
};

// --- Components ---

const Navbar = () => {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', path: `/${AppRoute.DASHBOARD}`, icon: '📊' },
    { name: 'Donate', path: `/${AppRoute.DONATE}`, icon: '💸' },
    { name: 'Expenses', path: `/${AppRoute.EXPENSES}`, icon: '🧾' },
  ];

  return (
    <nav className="bg-slate-900 text-white w-64 min-h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
          CharityFlow
        </h1>
        <p className="text-xs text-slate-400 mt-1">AI-Powered Management</p>
      </div>
      <div className="flex-1 py-6 space-y-2 px-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === item.path
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-slate-700 text-center text-xs text-slate-500">
        Host Database: Local<br/>
        UPI: {UPI_ID}
      </div>
    </nav>
  );
};

const Toast = ({ message, type }: { message: string, type: 'success' | 'info' }) => {
    if (!message) return null;
    return (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 transform transition-all duration-300 animate-slide-in ${type === 'success' ? 'bg-emerald-600' : 'bg-blue-600'} text-white`}>
            <span className="text-2xl">{type === 'success' ? '🎉' : 'ℹ️'}</span>
            <div>
                <h4 className="font-bold">{type === 'success' ? 'Success' : 'Info'}</h4>
                <p className="text-sm opacity-90">{message}</p>
            </div>
        </div>
    );
};

// --- Pages ---

const Dashboard = () => {
  const { expenses, donations } = useCharityData();

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalDonations - totalExpenses;

  // Chart Data Preparation
  const expenseByCategory = EXPENSE_CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(d => d.value > 0);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div className="p-8 space-y-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Financial Overview</h2>
            <p className="text-slate-500">Real-time donation and expense tracking</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">Live Data Connected</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 font-medium">Total Donations</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₹{totalDonations.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 font-medium">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">₹{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 font-medium">Net Balance</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">₹{balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm h-80">
          <h3 className="text-lg font-bold mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm h-80">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="overflow-y-auto h-full space-y-3 pb-8">
            {donations.slice(0, 5).map(d => (
              <div key={d.id} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg animate-fade-in">
                 <div>
                   <p className="font-semibold text-emerald-900">{d.donorName}</p>
                   <p className="text-xs text-emerald-600">{new Date(d.date).toLocaleDateString()} • {new Date(d.date).toLocaleTimeString()}</p>
                 </div>
                 <span className="font-bold text-emerald-700">+₹{d.amount}</span>
              </div>
            ))}
             {expenses.slice(0, 5).map(e => (
              <div key={e.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                 <div>
                   <p className="font-semibold text-red-900">{e.description}</p>
                   <p className="text-xs text-red-600">{new Date(e.date).toLocaleDateString()}</p>
                 </div>
                 <span className="font-bold text-red-700">-₹{e.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Donate = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [verifying, setVerifying] = useState(false);
  const [donorName, setDonorName] = useState('');
  
  // Dynamic QR code generation with proper UPI parameters
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&cu=${CURRENCY}&am=${amount}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}&qzone=1`;

  const handleSimulatePayment = () => {
    // Simulate a random "External" user paying
    const randomNames = ["Priya S.", "Rahul K.", "Amit Verma", "Sneha G."];
    const name = randomNames[Math.floor(Math.random() * randomNames.length)];
    
    StorageService.addDonation({
      id: Date.now().toString(),
      donorName: name,
      amount: amount,
      message: 'Mobile QR Scan',
      date: new Date().toISOString()
    });
    
    notify(`₹${amount} received from ${name}`, 'success');
  };

  const handleManualVerification = () => {
    if (!donorName) {
        notify("Please enter your name", "info");
        return;
    }

    StorageService.addDonation({
        id: Date.now().toString(),
        donorName: donorName,
        amount: amount,
        message: 'Verified QR Payment',
        date: new Date().toISOString()
    });

    notify(`Thank you ${donorName}! Payment of ₹${amount} recorded.`, 'success');
    setVerifying(false);
    setDonorName('');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start justify-center">
      
      {/* Configuration Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:w-1/2">
         <h2 className="text-2xl font-bold text-slate-800 mb-2">Donation Terminal</h2>
         <p className="text-slate-500 mb-6">Set up the terminal for the donor.</p>
         
         <div className="space-y-4">
             <div>
                <label className="block text-slate-600 font-medium mb-2">Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold text-lg"
                  />
                </div>
             </div>
             
             <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div className="text-sm text-purple-800">
                   <strong>How to Pay:</strong> <br/>
                   1. Open GPay/PhonePe/Paytm.<br/>
                   2. Scan the QR code.<br/>
                   3. <b>After paying, click the button below.</b>
                </div>
             </div>

             <div className="pt-4 border-t border-slate-100 mt-4">
                 <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Dev Tools</h3>
                 <button 
                    onClick={handleSimulatePayment}
                    className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
                 >
                   Simulate Random User Payment
                 </button>
             </div>
         </div>
      </div>

      {/* QR Card - GPay Style */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden w-full md:w-[350px] border border-slate-100 relative">
        <div className="p-8 flex flex-col items-center bg-white relative z-10">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-white text-xl font-medium mb-3">
              {PAYEE_NAME.charAt(0)}
            </div>
            <h3 className="text-xl font-normal text-slate-900">{PAYEE_NAME}</h3>
            <p className="text-sm text-slate-500">{UPI_ID}</p>
          </div>

          {/* QR Code Container */}
          <div className="p-1 bg-white rounded-lg relative">
             <img 
                src={qrUrl} 
                alt="Payment QR Code" 
                className="w-60 h-60 object-contain mix-blend-multiply" 
             />
             {/* Center Logo Overlay */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-7 h-7 bg-slate-100 rounded-full flex flex-wrap overflow-hidden opacity-90">
                    <div className="w-1/2 h-1/2 bg-blue-500"></div>
                    <div className="w-1/2 h-1/2 bg-green-500"></div>
                    <div className="w-1/2 h-1/2 bg-yellow-500"></div>
                    <div className="w-1/2 h-1/2 bg-red-500"></div>
                </div>
             </div>
          </div>

          {/* Interaction Area */}
          <div className="mt-6 w-full">
             {!verifying ? (
                 <button 
                    onClick={() => setVerifying(true)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2"
                 >
                    <span>✅ I have completed the payment</span>
                 </button>
             ) : (
                 <div className="bg-slate-50 p-4 rounded-xl animate-fade-in">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Your Name</label>
                    <input 
                        autoFocus
                        type="text" 
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Enter name for receipt"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setVerifying(false)}
                            className="flex-1 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleManualVerification}
                            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                        >
                            Confirm
                        </button>
                    </div>
                 </div>
             )}
          </div>

          {/* Footer Text */}
          <div className="mt-4 text-center">
            <p className="text-slate-500 text-sm">Scan to pay with any UPI app</p>
            <div className="flex justify-center gap-2 mt-2 opacity-60">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            </div>
          </div>

        </div>
        
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-50 to-transparent -z-0"></div>
      </div>

    </div>
  );
};

const Expenses = () => {
  const { expenses } = useCharityData();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!desc || !amount) return;
    setLoading(true);
    
    // AI Categorization
    let category = 'Other';
    try {
      category = await GeminiService.categorizeExpense(desc, Number(amount));
    } catch (err) {
      console.error("AI Categorization failed, defaulting to Other");
    }

    const newExp: Expense = {
      id: Date.now().toString(),
      description: desc,
      amount: Number(amount),
      category,
      date: new Date().toISOString()
    };

    StorageService.addExpense(newExp);
    setDesc('');
    setAmount('');
    setLoading(false);
    notify("Expense recorded successfully");
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Expense Management</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input 
            type="text" 
            value={desc} 
            onChange={e => setDesc(e.target.value)}
            placeholder="e.g. Printer paper"
            className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button 
          onClick={handleAdd}
          disabled={loading}
          className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Categorizing...' : 'Add Expense'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Description</th>
              <th className="p-4 font-semibold text-slate-600">Category (AI)</th>
              <th className="p-4 font-semibold text-slate-600">Date</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="p-4 text-slate-800">{e.description}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">
                    {e.category}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-sm">{new Date(e.date).toLocaleDateString()}</td>
                <td className="p-4 text-right font-medium text-slate-800">₹{e.amount}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">No expenses recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main App Layout ---

export default function App() {
  const { notification } = useCharityData(); // Hook used here just for notification state

  return (
    <HashRouter>
      <div className="flex min-h-screen">
        <Navbar />
        {notification && <Toast message={notification.message} type={notification.type} />}
        <main className="flex-1 ml-64 bg-slate-50 min-h-screen">
          <Routes>
            <Route path="/" element={<Navigate to={`/${AppRoute.DASHBOARD}`} replace />} />
            <Route path={`/${AppRoute.DASHBOARD}`} element={<Dashboard />} />
            <Route path={`/${AppRoute.DONATE}`} element={<Donate />} />
            <Route path={`/${AppRoute.EXPENSES}`} element={<Expenses />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
