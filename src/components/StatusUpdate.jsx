import React, { useState, useEffect } from 'react';

export default function StatusUpdate({ apiBaseUrl }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get('taskId');

  const handleComplete = async () => {
    if (!taskId) return alert("Task ID is missing!");
    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl, {
        method: "POST",
        body: JSON.stringify({ action: "updateStatus", taskId: taskId, status: "Completed" })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        alert("Great job! Task marked as Completed successfully. 🎉");
        // CRITICAL: Yahan koi window.location.reload() ya clear session nahi lagana hai!
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (!taskId) return <div className="p-12 text-center text-red-600 font-bold">Invalid Security Link. Token Missing.</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800">Task Action Terminal</h2>
        <p className="text-sm text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border">Updating Status for: <span className="font-mono text-indigo-600 font-bold">{taskId}</span></p>
        
        {success ? (
          <div className="bg-emerald-50 text-emerald-700 font-bold p-4 rounded-xl border border-emerald-100">✓ Task Successfully Executed & Closed!</div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black p-4 rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            {loading ? "Processing..." : "Mark as COMPLETED ✓"}
          </button>
        )}
      </div>
    </div>
  );
}