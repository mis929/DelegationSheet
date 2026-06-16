{/* App.jsx ke andar heading ke paas is tarah se trigger button lagayein */}
<div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-black text-slate-800">Your Operational Directives</h3>
  
  <button
    onClick={async () => {
      // 1. Unique users find karo jinki entries list me hain
      const assignedEmails = [...new Set(tasks.map(t => t.assigneeEmail))];
      
      for (const email of assignedEmails) {
        const userTasks = tasks.filter(t => t.assigneeEmail === email && t.status !== 'Completed');
        const targetUser = users.find(u => u.email === email);
        
        if (targetUser && userTasks.length > 0) {
          // Import functions dynamically inside trigger
          const { sendConsolidatedTaskDigest } = await import('./utils/whatsapp');
          await sendConsolidatedTaskDigest(targetUser.phone, targetUser.name, userTasks);
        }
      }
      alert("All employees have been updated with their consolidated task sheets via WhatsApp! 🚀");
    }}
    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1"
  >
    📱 Broadcast Full Day Summary to WhatsApp
  </button>
</div>