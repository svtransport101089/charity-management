import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { AppRoute, Expense, Donation, ChatMessage } from './types';
import { GeminiService } from './services/geminiService';
import { StorageService } from './services/storageService';
import { UPI_ID, CURRENCY, MODELS, EXPENSE_CATEGORIES, PAYEE_NAME } from './constants';

// --- Components ---

const Navbar = () => {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', path: `/${AppRoute.DASHBOARD}`, icon: '📊' },
    { name: 'Donate', path: `/${AppRoute.DONATE}`, icon: '💸' },
    { name: 'Expenses', path: `/${AppRoute.EXPENSES}`, icon: '🧾' },
    { name: 'Intelligence', path: `/${AppRoute.ANALYSIS}`, icon: '🧠' },
    { name: 'Creative Studio', path: `/${AppRoute.CREATIVE_STUDIO}`, icon: '🎨' },
    { name: 'Chat AI', path: `/${AppRoute.AI_CHAT}`, icon: '💬' },
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

// --- Pages ---

const Dashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    setExpenses(StorageService.getExpenses());
    setDonations(StorageService.getDonations());
  }, []);

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
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Financial Overview</h2>
        <p className="text-slate-500">Real-time donation and expense tracking</p>
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
              <div key={d.id} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                 <div>
                   <p className="font-semibold text-emerald-900">{d.donorName}</p>
                   <p className="text-xs text-emerald-600">{new Date(d.date).toLocaleDateString()}</p>
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
  
  // Dynamic QR code generation with proper UPI parameters
  // Ensure the PA uses the updated ID from constants
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&cu=${CURRENCY}&am=${amount}`;
  // Using a reliable QR code API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}&qzone=1`;

  const handleSimulateDonation = () => {
    StorageService.addDonation({
      id: Date.now().toString(),
      donorName: 'Anonymous Hero',
      amount: amount,
      message: 'Web Donation',
      date: new Date().toISOString()
    });
    alert(`Thank you! Simulated payment of ₹${amount} received.`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start justify-center">
      
      {/* Configuration Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:w-1/2">
         <h2 className="text-2xl font-bold text-slate-800 mb-2">Donation Settings</h2>
         <p className="text-slate-500 mb-6">Customize the donation amount to update the QR code.</p>
         
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
             
             <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-sm text-purple-800">
                   <strong>Note:</strong> Scanning the QR code will automatically pre-fill <b>₹{amount}</b> in your UPI app.
                </p>
             </div>

             <button 
                onClick={handleSimulateDonation}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors mt-4"
             >
               Simulate Payment (Demo)
             </button>
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
             {/* Visual overlay to simulate GPay/App logo in center as seen in screenshot */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-7 h-7 bg-slate-100 rounded-full flex flex-wrap overflow-hidden opacity-90">
                    <div className="w-1/2 h-1/2 bg-blue-500"></div>
                    <div className="w-1/2 h-1/2 bg-green-500"></div>
                    <div className="w-1/2 h-1/2 bg-yellow-500"></div>
                    <div className="w-1/2 h-1/2 bg-red-500"></div>
                </div>
             </div>
          </div>

          {/* Footer Text */}
          <div className="mt-8 text-center">
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setExpenses(StorageService.getExpenses());
  }, []);

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

    const updated = StorageService.addExpense(newExp);
    setExpenses(updated);
    setDesc('');
    setAmount('');
    setLoading(false);
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

const CreativeStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'generate_image' | 'edit_image' | 'generate_video'>('generate_image');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');

  const handleAction = async () => {
    if (!prompt) return;
    setLoading(true);
    setGeneratedImage(null);
    setVideoUrl(null);

    try {
      if (mode === 'generate_image') {
        const img = await GeminiService.generateImage(prompt, imgSize);
        setGeneratedImage(img);
      } else if (mode === 'edit_image') {
        if (!uploadFile) {
            alert("Please upload an image to edit");
            setLoading(false);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64 = reader.result as string;
                const img = await GeminiService.editImage(base64, prompt);
                setGeneratedImage(img);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        reader.readAsDataURL(uploadFile);
        return; // Early return for async reader
      } else if (mode === 'generate_video') {
         const video = await GeminiService.generateVideo(prompt, videoAspect);
         setVideoUrl(video);
      }
    } catch (err: any) {
      alert("Error: " + (err.message || "Failed to generate"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Creative Studio</h2>
      
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setMode('generate_image')} className={`px-4 py-2 rounded-lg ${mode === 'generate_image' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}>Image Gen (Pro)</button>
        <button onClick={() => setMode('edit_image')} className={`px-4 py-2 rounded-lg ${mode === 'edit_image' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}>Image Edit (Nano)</button>
        <button onClick={() => setMode('generate_video')} className={`px-4 py-2 rounded-lg ${mode === 'generate_video' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}>Video Gen (Veo)</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="w-full h-32 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            placeholder={
                mode === 'generate_image' ? "Describe the image you want..." :
                mode === 'edit_image' ? "Describe how to change the image (e.g., 'Make it retro')..." :
                "Describe the video scene..."
            }
          />

          {mode === 'generate_image' && (
              <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-slate-700">Size:</label>
                  {(['1K', '2K', '4K'] as const).map(s => (
                      <label key={s} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" checked={imgSize === s} onChange={() => setImgSize(s)} className="text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm">{s}</span>
                      </label>
                  ))}
              </div>
          )}

          {mode === 'edit_image' && (
              <input type="file" accept="image/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"/>
          )}

          {mode === 'generate_video' && (
               <div className="flex items-center space-x-4">
               <label className="text-sm font-medium text-slate-700">Aspect Ratio:</label>
               {(['16:9', '9:16'] as const).map(s => (
                   <label key={s} className="flex items-center space-x-2 cursor-pointer">
                       <input type="radio" checked={videoAspect === s} onChange={() => setVideoAspect(s)} className="text-emerald-600 focus:ring-emerald-500" />
                       <span className="text-sm">{s}</span>
                   </label>
               ))}
                <div className="text-xs text-orange-600">Requires User Selected API Key</div>
           </div>
          )}

          <button 
            onClick={handleAction} 
            disabled={loading}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? <span className="animate-pulse">Generating...</span> : 'Generate Magic'}
          </button>
        </div>

        <div className="bg-slate-200 rounded-xl flex items-center justify-center min-h-[400px] overflow-hidden border border-slate-300 relative">
             {loading && <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10">Processing...</div>}
             {!generatedImage && !videoUrl && !loading && <span className="text-slate-400">Result will appear here</span>}
             {generatedImage && <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />}
             {videoUrl && <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />}
        </div>
      </div>
    </div>
  );
};

const Analysis = () => {
    const [file, setFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'image' | 'video' | 'audio'>('image');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    // Maps State
    const [mapQuery, setMapQuery] = useState('');
    const [mapResult, setMapResult] = useState<{text: string, links: any[]} | null>(null);
    const [locating, setLocating] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        setResult('');
        try {
            if (type === 'image' && file) {
                const text = await GeminiService.analyzeImage(file, prompt);
                setResult(text);
            } else if (type === 'video' && file) {
                const text = await GeminiService.analyzeVideo(file, prompt);
                setResult(text);
            } else if (type === 'audio' && audioBlob) {
                 const reader = new FileReader();
                 reader.onloadend = async () => {
                     const base64 = reader.result as string;
                     const text = await GeminiService.transcribeAudio(base64, 'audio/webm'); // Assuming webm from recorder
                     setResult(text);
                     setLoading(false);
                 };
                 reader.readAsDataURL(audioBlob);
                 return;
            }
        } catch (e: any) {
            setResult(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
            };
            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
        } catch (e) {
            console.error("Mic error", e);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const handleMapsSearch = () => {
        setLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const res = await GeminiService.askMaps(mapQuery, position.coords.latitude, position.coords.longitude);
                    setMapResult(res);
                } catch(e) {
                    console.error(e);
                } finally {
                    setLocating(false);
                }
            }, () => {
                alert("Geolocation failed");
                setLocating(false);
            });
        }
    };

    return (
        <div className="p-8 space-y-12">
            {/* Analyzer Section */}
            <section>
                <h2 className="text-3xl font-bold text-slate-800 mb-6">Deep Analysis</h2>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex space-x-4 mb-4">
                         <button onClick={() => setType('image')} className={`px-3 py-1 rounded ${type==='image'?'bg-emerald-100 text-emerald-700':''}`}>Image</button>
                         <button onClick={() => setType('video')} className={`px-3 py-1 rounded ${type==='video'?'bg-emerald-100 text-emerald-700':''}`}>Video</button>
                         <button onClick={() => setType('audio')} className={`px-3 py-1 rounded ${type==='audio'?'bg-emerald-100 text-emerald-700':''}`}>Audio</button>
                    </div>

                    <div className="space-y-4">
                        {type !== 'audio' ? (
                            <input type="file" accept={type === 'image' ? "image/*" : "video/*"} onChange={e => setFile(e.target.files?.[0] || null)} />
                        ) : (
                            <div className="flex items-center space-x-4">
                                <button 
                                    onMouseDown={startRecording}
                                    onMouseUp={stopRecording}
                                    className={`px-4 py-2 rounded-full font-bold ${isRecording ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-700'}`}
                                >
                                    {isRecording ? 'Recording...' : 'Hold to Record'}
                                </button>
                                {audioBlob && <span className="text-green-600 text-sm">Audio captured!</span>}
                            </div>
                        )}
                        
                        {type !== 'audio' && (
                             <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="What should I look for?" className="w-full border p-2 rounded" />
                        )}

                        <button onClick={handleAnalyze} disabled={loading} className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                            {loading ? 'Analyzing...' : 'Analyze'}
                        </button>

                        {result && (
                            <div className="mt-4 p-4 bg-slate-50 rounded border border-slate-200 whitespace-pre-wrap">
                                {result}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Maps Section */}
            <section>
                <h2 className="text-3xl font-bold text-slate-800 mb-6">Location Intelligence</h2>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex gap-4">
                        <input type="text" value={mapQuery} onChange={e => setMapQuery(e.target.value)} placeholder="Find charity events near me..." className="flex-1 border p-2 rounded" />
                        <button onClick={handleMapsSearch} disabled={locating} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            {locating ? 'Locating...' : 'Search Maps'}
                        </button>
                    </div>
                    {mapResult && (
                        <div className="mt-6">
                            <div className="prose prose-slate max-w-none mb-4">{mapResult.text}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mapResult.links.map((chunk, i) => (
                                    chunk.maps && (
                                        <a key={i} href={chunk.maps.uri} target="_blank" rel="noreferrer" className="block p-4 border rounded hover:bg-slate-50">
                                            <h4 className="font-bold text-blue-600">{chunk.maps.title}</h4>
                                            {/* Safely rendering complex maps object would require more parsing, assuming basic link for demo */}
                                        </a>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

const AIChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '0', role: 'model', text: 'Hello! I am your CharityFlow assistant. I can help with planning, drafting emails, or answering complex questions using my thinking mode.', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [thinkingMode, setThinkingMode] = useState(false);
    const [webSearch, setWebSearch] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Convert history for API
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const result = await GeminiService.chat(history, userMsg.text, thinkingMode, webSearch);
            
            const modelMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: result.text || "I'm sorry, I couldn't generate a response.",
                timestamp: Date.now(),
                groundingSources: result.grounding?.map((g: any) => ({ uri: g.web?.uri || g.uri, title: g.web?.title || 'Source' }))
            };
            setMessages(prev => [...prev, modelMsg]);

            // Auto-speak if it's short
            if (result.text && result.text.length < 100) {
                 try {
                    const audioData = await GeminiService.speak(result.text);
                    const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
                    audio.play();
                 } catch (e) { /* ignore tts error */ }
            }

        } catch (error: any) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Error: ${error.message}`, timestamp: Date.now() }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-white">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-lg">Gemini Chat Assistant</h2>
                <div className="flex space-x-4 text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={thinkingMode} onChange={e => setThinkingMode(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500"/>
                        <span>Thinking Mode (Pro)</span>
                    </label>
                     <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={webSearch} onChange={e => setWebSearch(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500"/>
                        <span>Google Search</span>
                    </label>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            <div className="whitespace-pre-wrap">{m.text}</div>
                            {m.groundingSources && m.groundingSources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-200/20 text-xs">
                                    <p className="font-semibold mb-1 opacity-70">Sources:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {m.groundingSources.map((s, idx) => (
                                            <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="underline opacity-60 hover:opacity-100 truncate max-w-xs block">
                                                {s.title || s.uri}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 rounded-2xl p-4 animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-white">
                <div className="flex space-x-4">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        className="flex-1 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ask anything..."
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={loading}
                        className="bg-emerald-600 text-white px-6 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main App Layout ---

export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 ml-64 bg-slate-50 min-h-screen">
          <Routes>
            <Route path="/" element={<Navigate to={`/${AppRoute.DASHBOARD}`} replace />} />
            <Route path={`/${AppRoute.DASHBOARD}`} element={<Dashboard />} />
            <Route path={`/${AppRoute.DONATE}`} element={<Donate />} />
            <Route path={`/${AppRoute.EXPENSES}`} element={<Expenses />} />
            <Route path={`/${AppRoute.CREATIVE_STUDIO}`} element={<CreativeStudio />} />
            <Route path={`/${AppRoute.ANALYSIS}`} element={<Analysis />} />
            <Route path={`/${AppRoute.AI_CHAT}`} element={<AIChat />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}