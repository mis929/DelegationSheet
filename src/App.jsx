import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import TaskForm from './components/TaskForm';
import StatusUpdate from './components/StatusUpdate';

// ⚠️ Yahan apna Google Web App execution Deployment URL dalein
const DEPLOYMENT_API_URL = "https://script.google.com/macros/s/AKfycbx-xwmdDjPYj_kC1zDuWrVhKe0d0N58prsXm33yxBBNK9CzJLxhc4FOG2bxm4tFSeFD/exec";

export default function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const isStatusRoute = window.location.pathname === '/update-status';

  const loadCentralDatabase = async () => {
    try {
      const res = await fetch(`${DEPLOYMENT_API_URL}?action=getDashboardData`);
      const data = await res.json();
      setTasks(data.tasks || []);
      setUsers(data.users || []);
      setLeaderboard(data.leaderboard || []);
    } catch (err) { console.error("Database parsing exception triggered", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCentralDatabase(); }, []);

  if (isStatusRoute) return <StatusUpdate apiBaseUrl={DEPLOYMENT_API_URL} />;
  if (!session) return <LoginForm apiBaseUrl={DEPLOYMENT_API_URL} onLoginSuccess={setSession} />;
  if (loading) return <div className="p-12 text-center text-slate-700 font-black text-xl">Loading Core Systems...</div>;

  const myAssignedTasks = tasks.filter(t => t.assigneeEmail === session.email);
  const pendingCount = myAssignedTasks.filter(t => t.status !== 'Completed').length;
  const completedCount = myAssignedTasks.filter(t => t.status === 'Completed').length;
  const myTotalScore = leaderboard.find(l => l.email === session.email)?.score || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar Container */}
      <nav className="bg-white border-b p-4 px-8 flex justify-between items-center shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-indigo-900">TaskOps Core</h1>
          <p className="text-xs text-slate-400 font-semibold">Active Session: {session.name} ({session.role})</p>
        </div>
        <button onClick={() => setSession(null)} className="text-xs bg-rose-50 text-rose-600 font-bold px-4 py-2 rounded-xl border border-rose-100">Logout Dashboard</button>
      </nav>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Metric Cards Structure Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Workflow Load</h4>
            <p className="text-4xl font-black text-indigo-600 mt-2">{pendingCount} Tasks</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Executed Pipelines</h4>
            <p className="text-4xl font-black text-emerald-600 mt-2">{completedCount} Completed</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">Calculated Merit Score</h4>
            <p className="text-4xl font-black text-amber-600 mt-2">⭐ {myTotalScore} Points</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action Controllers Section */}
          <div className="lg:col-span-2 space-y-6">
            {session.role === 'Admin' && (
              <TaskForm users={users} apiBaseUrl={DEPLOYMENT_API_URL} refreshData={loadCentralDatabase} />
            )}

            <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-4">
              <h3 className="text-lg font-black text-slate-800">Your Operational Directives</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myAssignedTasks.map(t => (
                  <div key={t.id} className="border p-4 rounded-xl space-y-2 flex flex-col justify-between hover:shadow-md transition bg-slate-50/50">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black bg-slate-200 px-2 py-0.5 rounded uppercase">{t.priority}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-700'}`}>{t.status}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-2">{t.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                    </div>
                    
                    {/* UPDATED BUTTON HERE: Yahan par aapka naya link button perfect set ho gaya hai */}
                    <div className="border-t pt-3 flex justify-between items-center text-xs mt-4">
                      <span className="font-bold text-amber-600">⭐ {t.points} Pts</span>
                      <a 
                        href={`/update-status?taskId=${t.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black px-3 py-1.5 rounded-lg border border-indigo-100 transition shadow-xs"
                      >
                        Update Status Link 🔗
                      </a>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Engine UI */}
          <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-4 h-fit">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">🏆 Corporate Leaderboard</h3>
            <div className="divide-y space-y-3">
              {leaderboard.map((item, index) => (
                <div key={item.email} className="flex justify-between items-center pt-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-400 w-5">#{index + 1}</span>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.email}</p>
                    </div>
                  </div>
                  <span className="font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">⭐ {item.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}