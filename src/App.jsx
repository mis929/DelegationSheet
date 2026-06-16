import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import TaskForm from './components/TaskForm';
import StatusUpdate from './components/StatusUpdate';

// ⚠️ Apna Real App script execution URL yahan dalein
const DEPLOYMENT_API_URL = "https://script.google.com/macros/s/AKfycbx21QPYIpRkhOeOae-Cmy10V4jtkaXkhXirKK5WX32eZ39C1As-kinBUqGrubuM1R7JIQ/exec";

export default function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily'); // Tabs state control

  const isStatusRoute = window.location.pathname === '/update-status';

  const loadCentralDatabase = async () => {
    try {
      const res = await fetch(`${DEPLOYMENT_API_URL}?action=getDashboardData`);
      const data = await res.json();
      setTasks(data.tasks || []);
      setUsers(data.users || []);
    } catch (err) {
      console.error("Database tracking collapsed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCentralDatabase(); }, []);

  if (isStatusRoute) return <StatusUpdate apiBaseUrl={DEPLOYMENT_API_URL} />;
  if (!session) return <LoginForm apiBaseUrl={DEPLOYMENT_API_URL} onLoginSuccess={setSession} />;
  if (loading) return <div className="p-12 text-center text-slate-700 font-black text-xl animate-pulse">Synchronizing Core Analytical Metrics...</div>;

  // 🗓️ CURRENT DATE FILTER STRING (DD-MM-YYYY / YYYY-MM-DD logic checking)
  const todayStr = new Date().toISOString().split('T')[0];

  // ==================== 1. DAILY ENGINE LOGIC ====================
  const dailyTasksReport = tasks.filter(t => {
    if (!t.deadline) return false;
    const taskDateStr = new Date(t.deadline).toISOString().split('T')[0];
    return taskDateStr === todayStr;
  });

  // ==================== 2. WEEKLY REPORT COMPILATION ====================
  const getWeeklyMetrics = () => {
    const reportMap = {};
    tasks.forEach(t => {
      const targetUser = users.find(u => u.email === t.assigneeEmail);
      if (!targetUser) return;
      
      const key = `${t.weekNo}-${t.assigneeEmail}`;
      if (!reportMap[key]) {
        reportMap[key] = {
          date: t.deadline ? new Date(t.deadline).toLocaleDateString('en-GB') : 'N/A',
          weekNo: t.weekNo,
          name: targetUser.name,
          department: targetUser.department || 'Operations',
          totalTasks: 0,
          doneTasks: 0,
          pendingTasks: 0,
          score: 0
        };
      }
      reportMap[key].totalTasks += 1;
      if (t.status === 'Completed') {
        reportMap[key].doneTasks += 1;
        reportMap[key].score += t.points;
      } else {
        reportMap[key].pendingTasks += 1;
      }
    });
    return Object.values(reportMap);
  };

  // ==================== 3. MONTHLY ACCUMULATED RECORDS ====================
  const getMonthlyMetrics = () => {
    const reportMap = {};
    tasks.forEach(t => {
      const targetUser = users.find(u => u.email === t.assigneeEmail);
      if (!targetUser) return;

      const key = `${t.monthKey}-${t.assigneeEmail}`;
      if (!reportMap[key]) {
        reportMap[key] = {
          month: t.monthKey,
          name: targetUser.name,
          department: targetUser.department || 'Operations',
          totalPoints: 0
        };
      }
      if (t.status === 'Completed') {
        reportMap[key].totalPoints += t.points;
      }
    });
    return Object.values(reportMap);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Structural Top Navbar */}
      <nav className="bg-white border-b p-4 px-8 flex justify-between items-center shadow-xs">
        <div>
          <h1 className="text-xl font-black tracking-tight text-indigo-900">Operational Matrix Control Center</h1>
          <p className="text-xs text-slate-400 font-bold">Authenticated: {session.name} ({session.role})</p>
        </div>
        <button onClick={() => setSession(null)} className="text-xs font-bold px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 transition hover:bg-rose-100">Reset Gateway</button>
      </nav>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Dynamic Navigation Sub-tab Bar */}
        <div className="flex border-b border-slate-200 gap-2">
          <button onClick={() => setActiveTab('daily')} className={`px-4 py-2 text-xs font-black rounded-t-xl transition ${activeTab === 'daily' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-b-0 hover:bg-slate-100'}`}>📅 Live Daily Log</button>
          <button onClick={() => setActiveTab('weekly')} className={`px-4 py-2 text-xs font-black rounded-t-xl transition ${activeTab === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-b-0 hover:bg-slate-100'}`}>📊 Weekly Performance Board</button>
          <button onClick={() => setActiveTab('monthly')} className={`px-4 py-2 text-xs font-black rounded-t-xl transition ${activeTab === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-b-0 hover:bg-slate-100'}`}>🏆 Monthly Aggregate Score</button>
        </div>

        {/* ==================== PANEL DISPLAY SWITCHER ==================== */}
        
        {activeTab === 'daily' && (
          <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-800">Daily Task Monitoring Module - (Today's Scheduled System)</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-black uppercase">
                    <th className="p-3">Task ID</th>
                    <th className="p-3">Resource / Name</th>
                    <th className="p-3">Assigned Blueprint Task</th>
                    <th className="p-3">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-slate-700">
                  {dailyTasksReport.map(t => {
                    const uObj = users.find(u => u.email === t.assigneeEmail);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-slate-400">{t.id}</td>
                        <td className="p-3 font-bold text-slate-900">{uObj ? uObj.name : t.assigneeEmail}</td>
                        <td className="p-3">{t.title}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded font-black uppercase text-[10px] ${t.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{t.status}</span></td>
                      </tr>
                    );
                  })}
                  {dailyTasksReport.length === 0 && <tr><td colSpan="4" className="text-center p-8 text-slate-400 font-bold">No operational records synced for today's deadline schedule.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-800">Weekly Task Performance Engine (Real-time Metric Calculation)</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-black uppercase">
                    <th className="p-3">Reference Date</th>
                    <th className="p-3">Week No</th>
                    <th className="p-3">Resource Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-center">Total Allocation</th>
                    <th className="p-3 text-center text-emerald-600">Done</th>
                    <th className="p-3 text-center text-rose-600">Pending</th>
                    <th className="p-3 text-right text-amber-600">Auto-Imported Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-slate-700">
                  {getWeeklyMetrics().map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-semibold text-slate-400">{row.date}</td>
                      <td className="p-3 font-bold text-indigo-600">W-{row.weekNo}</td>
                      <td className="p-3 font-bold text-slate-900">{row.name}</td>
                      <td className="p-3 text-slate-500">{row.department}</td>
                      <td className="p-3 text-center font-bold">{row.totalTasks}</td>
                      <td className="p-3 text-center font-bold text-emerald-600 bg-emerald-50/30">{row.doneTasks}</td>
                      <td className="p-3 text-center font-bold text-rose-600 bg-rose-50/30">{row.pendingTasks}</td>
                      <td className="p-3 text-right font-black text-amber-600">⭐ {row.score} Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-800">Monthly Accumulation Summary Board</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-black uppercase">
                    <th className="p-3">Calendar Month</th>
                    <th className="p-3">Resource Name</th>
                    <th className="p-3">Department Domain</th>
                    <th className="p-3 text-right text-amber-600">Total Accumulation Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-slate-700">
                  {getMonthlyMetrics().map((mRow, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-black text-slate-500 uppercase">{mRow.month}</td>
                      <td className="p-3 font-bold text-slate-900">{mRow.name}</td>
                      <td className="p-3 text-slate-400 font-semibold">{mRow.department}</td>
                      <td className="p-3 text-right font-black text-emerald-600 bg-emerald-50/20">🏆 {mRow.totalPoints} Points</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin Form Task Creation Element Insertion Block */}
        {session.role === 'Admin' && (
          <div className="pt-4 border-t">
            <TaskForm users={users} apiBaseUrl={DEPLOYMENT_API_URL} refreshData={loadCentralDatabase} />
          </div>
        )}
      </div>
    </div>
  );
}