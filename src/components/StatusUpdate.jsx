import React, { useState, useEffect } from 'react';

export default function StatusUpdate({ apiBaseUrl }) {
  const [task, setTask] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(window.location.search);
  const taskId = queryParams.get('taskId');

  const fetchTaskDetails = async () => {
    const res = await fetch(`${apiBaseUrl}?action=getDashboardData`);
    const data = await res.json();
    const found = data.tasks?.find(t => t.id === taskId);
    if (found) { setTask(found); setStatus(found.status); }
    setLoading(false);
  };

  useEffect(() => { if (taskId) fetchTaskDetails(); }, [taskId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl, {
        method: "POST",
        body: JSON.stringify({ action: "updateStatus", taskId, status })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Status updated to ${status}! System Score allocated.`);
        window.location.href = "/";
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Verifying Sheet Log Entity...</div>;
  if (!task) return <div className="p-12 text-center text-rose-500 font-bold">Error: Requested Task Node Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border w-full max-w-md space-y-6">
        <div>
          <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-widest">{task.recurrenceType}</span>
          <h2 className="text-2xl font-black text-slate-800 mt-2">{task.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{task.description}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 text-slate-600 font-medium">
          <p>⭐ Allocated Score: <span className="text-amber-600 font-bold">{task.points} Points</span></p>
          <p>📅 Timeline Limit: <span className="text-rose-600 font-bold">{task.deadline}</span></p>
        </div>
        <form onSubmit={handleUpdate} className="space-y-4">
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border p-3.5 bg-slate-50 rounded-xl text-sm font-bold">
            <option value="Pending">⌛ Pending Log</option>
            <option value="In Progress">⚙️ In Progress</option>
            <option value="Completed">✅ Mark Fully Completed</option>
          </select>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold p-3.5 rounded-xl hover:bg-emerald-700 transition shadow-lg">
            Commit Execution & Award Scores
          </button>
        </form>
      </div>
    </div>
  );
}