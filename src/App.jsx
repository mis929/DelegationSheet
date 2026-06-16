import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import TaskForm from './components/TaskForm';
import StatusUpdate from './components/StatusUpdate';

// ⚠️ APNA REAL GOOGLE WEB APP URL YAHAN PASTE KAREIN
const DEPLOYMENT_API_URL = "https://script.google.com/macros/s/AKfycbzWFC_H1y_Lr4RYA3Q9ZE0Xr8-TrmJ6tMMybmio2baYhsVl719ud2OUi_a_XRCbqElUFg/exec";

export default function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily'); 

  const isStatusRoute = window.location.pathname === '/update-status';

  const loadCentralDatabase = async () => {
    try {
      setLoading(true);
      console.log("Fetching database...");
      
      // CORS aur redirect issues ko handle karne ke liye safe fetch sequence
      const res = await fetch(`${DEPLOYMENT_API_URL}?action=getDashboardData`, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain"
        }
      });
      
      const textData = await res.text();
      
      // Validation check: Agar Google koi HTML error return kare
      if (textData.startsWith("<!DOCTYPE") || textData.startsWith("<html")) {
        throw new Error("Google Script returned HTML instead of valid JSON data.");
      }
      
      const data = JSON.parse(textData);
      console.log("Database Loaded successfully:", data);
      
      setTasks(data.tasks || []);
      setUsers(data.users || []);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error("Database connection failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCentralDatabase();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '10px' }}>Connecting to Sheet Database...</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Please wait, resolving secure pipeline.</p>
        </div>
      </div>
    );
  }

  if (isStatusRoute) return <StatusUpdate apiBaseUrl={DEPLOYMENT_API_URL} />;
  if (!session) return <LoginForm apiBaseUrl={DEPLOYMENT_API_URL} onLoginSuccess={setSession} />;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">TaskOps Core</h1>
          <p className="text-xs text-slate-400">Active Session: {session.name} ({session.role})</p>
        </div>
        <button onClick={() => setSession(null)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition">
          Logout
        </button>
      </header>

      {/* Main Grid Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex space-x-4 border-b border-slate-800">
            {['daily', 'weekly', 'monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 capitalize text-sm font-medium transition-all ${activeTab === tab ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab} Overview
              </button>
            ))}
          </div>
          
          <TaskForm tasks={tasks} session={session} activeTab={activeTab} reloadTrigger={loadCentralDatabase} />
        </div>

        {/* Corporate Leaderboard Component Area */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-400">
            🏆 Corporate Leaderboard
          </h2>
          <div className="space-y-3">
            {leaderboard.map((user, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div>
                  <p className="font-semibold text-sm">#{idx + 1} {user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-bold border border-amber-500/20">
                  ⭐️ {user.score} Pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}