import React, { useState } from 'react';

export default function LoginForm({ apiBaseUrl, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl, {
        method: "GET",
        body: JSON.stringify({ action: "login", email, password })
      });
      const data = await res.json();
      console.log(res)
      if (data.success) {
        onLoginSuccess(data.status);

      } else {
        alert(data.message || "Invalid Details");
      }
    } catch (err) {
      console.log(err)
      alert("Database connection failed!");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1">Delegation System Authorization Gateway</p>
        </div>
        <div className="space-y-4">
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-slate-200 p-3.5 rounded-xl text-sm focus:outline-indigo-600 bg-slate-50 font-medium" />
          <input type="password" placeholder="Account Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border border-slate-200 p-3.5 rounded-xl text-sm focus:outline-indigo-600 bg-slate-50 font-medium" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3.5 rounded-xl transition shadow-lg shadow-indigo-200 disabled:opacity-50">
          {loading ? "Authenticating Master Session..." : "Secure Login"}
        </button>
      </form>
    </div>
  );
}