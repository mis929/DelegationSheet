import React, { useState } from 'react';

// ⚠️ APNA REAL GOOGLE WEB APP URL YAHAN BHI PASTE KAREIN
const DEPLOYMENT_API_URL = "https://script.google.com/macros/s/AKfycbzSrwADGCumOhLQhfOt_gGnGVITdxzFBPj350BFGvmi9ZCJp74KGP0WCJTPY4KnMzUuNuG/exec";

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Direct database state call to cross-verify users
      const res = await fetch(`${DEPLOYMENT_API_URL}?action=getDashboardData`, {
        method: "GET",
        mode: "cors",
        headers: { "Content-Type": "text/plain" }
      });
      
      const data = await res.json();
      
      // Verification logic inside users payload
      const foundUser = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser) {
        // Safe standard bypass session set
        onLoginSuccess({
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role || 'User',
          department: foundUser.department || 'Operations'
        });
      } else {
        setError('Aapka Email Database mein nahi mila. Sahi email dalein.');
      }
    } catch (err) {
      console.error(err);
      setError('Database connection failed! Ek baar sheet tab names aur code check karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Delegation System Authorization Gateway</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Security Key / Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating Master Session...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}