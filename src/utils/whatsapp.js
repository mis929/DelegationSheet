const GREEN_API_ID = "7107628437"; 
const GREEN_API_TOKEN = "7196edcfec4149228a084c62b7eabc4da111f13c430c416887";
// 🚀 NAYA SOLUTION: Pure din ki Task List Table format me bhejne ke liye function
export const sendConsolidatedTaskDigest = async (phone, employeeName, tasksList) => {
  if (!phone || !tasksList || tasksList.length === 0) return;

  let cleanPhone = String(phone).replace(/\D/g, "");
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const url = `https://api.green-api.com/waInstance${GREEN_API_ID}/sendMessage/${GREEN_API_TOKEN}`;

  // Current Date format
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Header System
  let message = `Hello *${employeeName}*,\n\n` +
                `Here is the list of tasks for you to complete. Please note that the below list contains the *Pending* tasks, Today's tasks and *Planned* tasks.\n\n` +
                `Tasks can be recurring or one time in nature.\n\n` +
                `*📋 PLANNED/PENDING TASK LIST AS ON ${todayStr}*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Dynamic Row Compilation (Jaise aapki PDF Table me tha)
  tasksList.forEach((task, index) => {
    const statusEmoji = task.status === 'Pending' ? '🔴' : '🟡';
    const baseUpdateLink = `https://delegation-sheet.vercel.app/update-status?taskId=${task.id}`;

    message += `*Task No.* ${index + 1}\n` +
               `*🔹 Task Details:* ${task.title}\n` +
               `*🔹 Status:* ${statusEmoji} ${task.status}\n` +
               `*🔹 Merit Value:* ⭐ ${task.points} Pts\n` +
               `*🔗 Action Link:* ${baseUpdateLink}\n` +
               `----------------------------------------\n\n`;
  });

  message += `_(Note: Agar links click na ho rahe hon, toh is chat me pehle ek baar "OK" likh kar reply kar dein)_`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: `${targetPhone}@c.us`, message: message })
    });
    const result = await response.json();
    console.log("Digest Message Sent status:", result);
  } catch (err) {
    console.error("Digest transmission collapsed:", err);
  }
};