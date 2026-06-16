import React, { useState } from 'react';
import { triggerWhatsAppAlert } from '../utils/whatsapp';

export default function TaskForm({ users, apiBaseUrl, refreshData }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [recurrence, setRecurrence] = useState('One-time');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [points, setPoints] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetUser = users.find(u => u.email === assigneeEmail);
    if (!targetUser) return alert("Select an employee!");

    setSubmitting(true);
    const taskId = "T-" + Date.now();
    
    const newTask = {
      id: taskId,
      title,
      description: desc,
      assigneeEmail,
      assigneePhone: targetUser.phone,
      priority,
      status: "Pending",
      recurrenceType: recurrence,
      startDate: recurrence === 'One-time' ? new Date().toISOString().split('T')[0] : startDate,
      lastTriggeredDate: "Never",
      deadline: targetDate, // Mapping deadline to targetDate
      points: Number(points)
    };

    try {
      const res = await fetch(apiBaseUrl, {
        method: "POST",
        body: JSON.stringify({ action: "createTask", task: newTask })
      });
      const data = await res.json();
      if (data.success) {
        alert("Task successfully created!");
        await triggerWhatsAppAlert(targetUser.phone, title, points, targetDate, taskId);
        refreshData();
        setTitle(''); setDesc(''); setTargetDate('');
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight border-b pb-2">Delegate Operations Panel</h3>
      <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border p-3 rounded-xl text-sm focus:outline-indigo-600 bg-slate-50" />
      <textarea placeholder="Task Description..." value={desc} onChange={e => setDesc(e.target.value)} required className="w-full border p-3 rounded-xl text-sm focus:outline-indigo-600 bg-slate-50 h-24" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select value={assigneeEmail} onChange={e => setAssigneeEmail(e.target.value)} required className="border p-3 rounded-xl text-sm bg-slate-50">
          <option value="">Assign Target Employee</option>
          {users.map(u => <option key={u.email} value={u.email}>{u.name}</option>)}
        </select>
        <select value={recurrence} onChange={e => setRecurrence(e.target.value)} className="border p-3 rounded-xl text-sm bg-slate-50 font-medium">
          <option value="One-time">📌 One-time Executable</option>
          <option value="Daily Repeat">🔄 Daily Recurring Mode</option>
          <option value="Weekly Repeat">📅 Weekly Recurring Mode</option>
          <option value="Monthly Repeat">📆 Monthly Recurring Mode</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select value={priority} onChange={e => setPriority(e.target.value)} className="border p-3 rounded-xl text-sm bg-slate-50">
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>

        {/* Dynamic Condition Fields */}
        {recurrence !== 'One-time' && (
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 mb-1 px-1">START DATE</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="border p-2.5 rounded-xl text-sm bg-slate-50" />
          </div>
        )}

        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 mb-1 px-1">
            {recurrence === 'One-time' ? 'TARGET DATE (DEADLINE)' : 'REPEAT UNTIL (TARGET DATE)'}
          </label>
          <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required className="border p-2.5 rounded-xl text-sm bg-slate-50" />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 mb-1 px-1">VALUE SCORE</label>
          <input type="number" placeholder="Points" value={points} onChange={e => setPoints(e.target.value)} required className="border p-2.5 rounded-xl text-sm bg-slate-50 font-bold text-amber-600" />
        </div>
      </div>

      <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white font-bold p-3.5 rounded-xl hover:bg-indigo-700 transition">
        {submitting ? "Processing Engine..." : "Confirm & Broadcast to WhatsApp"}
      </button>
    </form>
  );
}