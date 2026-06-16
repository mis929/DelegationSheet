import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import TaskForm from './components/TaskForm';
import StatusUpdate from './components/StatusUpdate';

// ⚠️ YAHAN APNA ASLI GOOGLE WEB APP SCRIPT URL COPY-PASTE KAREIN
const DEPLOYMENT_API_URL = "YOUR_GOOGLE_SCRIPT_WEB_APP_URL";

export default function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily'); // Controls analytical tabs

  const isStatusRoute = window.location.pathname === '/update-status';

  const loadCentralDatabase = async () => {
    try {
      const res = await fetch(`${DEPLOYMENT_API_URL}?action=getDashboardData`);
      const data = await res.json();
      setTasks(data.tasks || []);
      setUsers(data.users || []);
      setLeaderboard(data.leaderboard || []);
    } catch (err) { 
      console.error("Database connection failure:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadCentralDatabase(); }, []);

  if (isStatusRoute) return <StatusUpdate apiBaseUrl={DEPLOYMENT_API_URL} />;
  if (!session) return <LoginForm apiBaseUrl={DEPLOYMENT_API_URL} onLoginSuccess={setSession} />;
  if (loading) return <div className="p-12 text-center text-slate-700 font-black text-xl animate-pulse">Loading System Core Metrics...</div>;

  // Global variables and counts
  const myAssignedTasks = tasks.filter(t => t.assigneeEmail === session.email);
  const pendingCount = myAssignedTasks.filter(t => t.status !== 'Completed').length;
  const completedCount = myAssignedTasks.filter(t => t.status === 'Completed').length;
  const myTotalScore = leaderboard.find(l => l.email === session.email)?.score || 0;

  // Helper date conversions
  const todayISO = new Date().toISOString().split('T')[0];

  // ==================== 1. DAILY ENGINE (LOGGED IN USER WISE FOR TODAY) ====================
  const myDailyTasks = myAssignedTasks.filter(t => {
    if (!t.deadline) return false;
    // Format matching verification
    const taskDateStr = new Date(t.deadline).toISOString().split('T')[0];
    return taskDateStr === todayISO;
  });

  // ==================== 2. WEEKLY ENGINE (ALL USERS AUTO-IMPORT AGGREGATION) ====================
  const getWeeklyMetrics = () => {
    const reportMap = {};
    
    tasks.forEach(t => {
      const targetUser = users.find(u => u.email === t.assigneeEmail);
      if (!targetUser) return;

      // Calculate dynamic Week number from deadline date
      const d = new Date(t.deadline || new Date());
      const tempDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
      const startOfYear = new Date(Date.UTC(tempDate.getUTFullYear(), 0, 1));
      const calculatedWeekNo = Math.ceil((((tempDate - startOfYear) / 86400000) + 1) / 7) || 1;

      const weekKey = `${calculatedWeekNo}-${t.assigneeEmail}`;

      if (!reportMap[weekKey]) {
        reportMap[weekKey] = {
          date: t.deadline ? new Date(t.deadline).toLocaleDateString('en-GB') : 'N/A',
          weekNo: calculatedWeekNo,
          name: targetUser.name,
          department: targetUser.department || 'Operations',
          totalTasks: 0,
          doneTasks: 0,
          pendingTasks: 0,
          score: 0
        };
      }

      reportMap[weekKey].totalTasks += 1;
      if (t.status === 'Completed') {
        reportMap[weekKey].doneTasks += 1;
        reportMap[weekKey].score += Number(t.points || 0);
      } else {
        reportMap[weekKey].pendingTasks += 1;
      }
    });

    return Object.values(reportMap);
  };

  // ==================== 3. MONTHLY ENGINE (ALL USERS MASTER ACCUMULATION) ====================
  const getMonthlyMetrics = () => {
    const reportMap = {};
    
    tasks.forEach(t => {
      const targetUser = users.find(u => u.email === t.assigneeEmail);
      if (!targetUser) return;

      const d = new Date(t.deadline || new Date());
      const monthKey = d.toLocaleString('default', { month: 'short' }) + "-" + d.getFullYear();
      const uniqueUserMonthKey = `${monthKey}-${t.assigneeEmail}`;

      if (!reportMap[uniqueUserMonthKey]) {
        reportMap[uniqueUserMonthKey] = {
          month: monthKey.toUpperCase(),
          name: targetUser.name,
          department: targetUser.department || 'Operations',
          totalPoints: 0
        };
      }

      if (t.status === 'Completed') {
        reportMap[uniqueUserMonthKey].totalPoints += Number(t.points || 0);
      }
    });

    return Object.values(reportMap);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar Section */}
      <nav className="bg-white border-b p-4 px-8 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-indigo-900 tracking-tight">TaskOps Core</h1>
          <p className="text-xs text-slate-400 font-semibold">Active Session: {session.name} ({session.role})</p>
        </div>
        <button onClick={() => setSession(null)} className="text-xs bg-rose-50 text-rose-600 font-bold px-4 py-2 rounded-xl border border-rose-100 transition hover:bg-rose-100">Logout</button>
      </nav>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Top Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h4 className="text-xs font-bold text-slate-400 uppercase">Pending Workflow Load</h4><p className="text-4xl font-black text-indigo-600 mt-2">{pendingCount} Tasks</p></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h4 className="text-xs font-bold text-slate-400 uppercase">Executed Pipelines</h4><p className="text-4xl font-black text-emerald-600 mt-2">{completedCount} Completed</p></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50"><h4 className="text-xs font-bold text-amber-700 uppercase">Calculated Merit Score</h4><p className="text-4xl font-black text-amber-600 mt-2">⭐ {myTotalScore} Points</p></div>
        </div>

        {/* 📊 NEW ADVANCED ANALYTICAL TABS MODULE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex bg-slate-50 border-b text-xs font-black text-slate-500">
            <button onClick={() => setActiveTab('daily')} className={`px-6 py-3.5 transition flex items-center gap-1.5 ${activeTab === 'daily' ? 'bg-white text-indigo-600 border-r' : 'hover:bg-slate-100/70'}`}>📅 My Daily Task Log</button>
            <button onClick={() => setActiveTab('weekly')} className={`px-6 py-3.5 transition flex items-center gap-1.5 ${activeTab === 'weekly' ? 'bg-white text-indigo-600 border-x' : 'hover:bg-slate-100/70'}`}>📊 Weekly Score Tracker</button>
            <button onClick={() => setActiveTab('monthly')} className={`px-6 py-3.5 transition flex items-center gap-1.5 ${activeTab === 'monthly' ? 'bg-white text-indigo-600 border-l' : 'hover:bg-slate-100/70'}`}>🏆 Monthly Summary</button>
          </div>

          <div className="p-6">
            {/* TAB 1: DAILY VIEW */}
            {activeTab === 'daily' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center"><h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">🎯 Tasks Scheduled For Today ({new Date().toLocaleDateString('en-GB')})</h3></div>
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead><tr className="bg-slate-50 text-slate-500 font-bold border-b"><th className="p-3">Task ID</th><th className="p-3">Task Details</th><th className="p-3">Status</th></tr></thead>
                    <tbody className="divide-y font-semibold text-slate-700">
                      {myDailyTasks.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50"><td className="p-3 font-mono text-slate-400 font-bold">{t.id}</td><td className="p-3 font-bold text-slate-900">{t.title}</td><td className="p-3"><span className={`px-2 py-0.5 rounded font-black text-[10px] ${t.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{t.status}</span></td></tr>
                      ))}
                      {myDailyTasks.length === 0 && <tr><td colSpan="3" className="text-center p-6 text-slate-400 font-bold">Aapke liye aaj ki date ka koi task scheduled nahi hai.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: WEEKLY SCORE ENGINE */}
            {activeTab === 'weekly' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">📊 Auto-Calculated Weekly Score Grid</h3>
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b">
                        <th className="p-3">Date</th><th className="p-3">Week No</th><th className="p-3">Name</th><th className="p-3">Department</th><th className="p-3 text-center">Total Task</th><th className="p-3 text-center text-emerald-600">Done</th><th className="p-3 text-center text-amber-600">Pending</th><th className="p-3 text-right text-indigo-600">Final Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-semibold text-slate-700">
                      {getWeeklyMetrics().map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-400">{row.date}</td><td className="p-3 font-black text-indigo-600">Week {row.weekNo}</td><td className="p-3 font-bold text-slate-900">{row.name}</td><td className="p-3 text-slate-500">{row.department}</td><td className="p-3 text-center font-bold">{row.totalTasks}</td><td className="p-3 text-center text-emerald-600 bg-emerald-50/20 font-bold">{row.doneTasks}</td><td className="p-3 text-center text-amber-600 bg-amber-50/20 font-bold">{row.pendingTasks}</td><td className="p-3 text-right font-black text-indigo-600 bg-indigo-50/10">⭐ {row.score} Pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: MONTHLY MASTER ACCUMULATION */}
            {activeTab === 'monthly' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">🏆 Cumulative Monthly Performance Standings</h3>
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead><tr className="bg-slate-50 text-slate-500 font-bold border-b"><th className="p-3">Month</th><th className="p-3">Name</th><th className="p-3">Department</th><th className="p-3 text-right text-emerald-600">Accumulated Score</th></tr></thead>
                    <tbody className="divide-y font-semibold text-slate-700">
                      {getMonthlyMetrics().map((mRow, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50"><td className="p-3 font-bold text-slate-500">{mRow.month}</td><td className="p-3 font-bold text-slate-900">{mRow.name}</td><td className="p-3 text-slate-400">{mRow.department}</td><td className="p-3 text-right font-black text-emerald-600 bg-emerald-50/30">🏆 {mRow.totalPoints} Points</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Core Lower Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {session.role === 'Admin' && <TaskForm users={users} apiBaseUrl={DEPLOYMENT_API_URL} refreshData={loadCentralDatabase} />}

            {/* Operational Task Cards */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                <h3 className="text-lg font-black text-slate-800">Your Operational Directives</h3>
                {session.role === 'Admin' && (
                  <button
                    onClick={async () => {
                      const assignedEmails = [...new Set(tasks.map(t => t.assigneeEmail))];
                      for (const email of assignedEmails) {
                        const userTasks = tasks.filter(t => t.assigneeEmail === email && t.status !== 'Completed');
                        const targetUser = users.find(u => u.email === email);
                        if (targetUser && userTasks.length > 0) {
                          const { sendConsolidatedTaskDigest } = await import('./utils/whatsapp');
                          await sendConsolidatedTaskDigest(targetUser.phone, targetUser.name, userTasks);
                        }
                      }
                      alert("Sabhi employees ko unki consolidated task list WhatsApp par bhej di gayi hai! 🚀");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    📱 Broadcast Full Day Summary to WhatsApp
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myAssignedTasks.map((t) => (
                  <div key={t.id} className="border border-slate-200 p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="bg-indigo-50 text-indigo-700 text-[11px] font-black px-2.5 py-1 rounded-md">📅 Target: {t.deadline || 'No Date'}</span>
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-md ${t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{t.status}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-2 text-sm">{t.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">{t.description}</p>
                      <div className="text-[10px] font-mono text-slate-400 font-bold bg-white border px-2 py-0.5 rounded w-fit">🆔 ID: {t.id}</div>
                    </div>
                    
                    <div className="border-t pt-3 flex justify-between items-center text-xs mt-4">
                      <span className="font-bold text-amber-600">⭐ {t.points} Pts</span>
                      <a href={`/update-status?taskId=${t.id}`} target="_blank" rel="noopener noreferrer" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black px-3 py-1.5 rounded-lg border border-indigo-100 transition shadow-xs">Update Status Link 🔗</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Leaderboard */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 h-fit">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">🏆 Corporate Leaderboard</h3>
            <div className="divide-y space-y-3">
              {leaderboard.map((item, index) => (
                <div key={item.email} className="flex justify-between items-center pt-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-400 w-5">#{index + 1}</span>
                    <div><p className="font-bold text-slate-800">{item.name}</p><p className="text-xs text-slate-400">{item.email}</p></div>
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