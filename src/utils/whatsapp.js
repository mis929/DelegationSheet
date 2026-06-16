const GREEN_API_ID = "7107628437"; 
const GREEN_API_TOKEN = "7196edcfec4149228a084c62b7eabc4da111f13c430c416887";
// ⚠️ Apne Green API Console se dekh kar sahi Instance ID aur Token daalein
export const triggerWhatsAppAlert = async (phone, taskTitle, points, deadline, taskId) => {
  if (!phone) return;
  let cleanPhone = String(phone).replace(/\D/g, "");
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const url = `https://api.green-api.com/waInstance${GREEN_API_ID}/sendMessage/${GREEN_API_TOKEN}`;
  const fullStatusLink = `https://delegation-sheet.vercel.app/update-status?taskId=${taskId}`;
  
  let message = `📌 *ACTION REQUIRED: NEW TASK ASSIGNED* 📌\n\n` +
                `*Task:* ${taskTitle}\n` +
                `*Points:* ⭐ ${points} Pts\n` +
                `*Target Date:* 📅 ${deadline}\n\n` +
                `⚠️ *TASK STATUS UPDATE LINK:* ⚠️\n${fullStatusLink}`;

  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId: `${targetPhone}@c.us`, message }) });
  } catch (err) { console.error(err); }
};

// 🎯 YEH NAYA FUNCTION HAI JO TELEGRAM/PDF JAISA CONSOLIDATED MESSAGE BHEJEGA
export const sendConsolidatedTaskDigest = async (phone, employeeName, tasksList) => {
  if (!phone || !tasksList || tasksList.length === 0) return;

  let cleanPhone = String(phone).replace(/\D/g, "");
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const url = `https://api.green-api.com/waInstance${GREEN_API_ID}/sendMessage/${GREEN_API_TOKEN}`;

  let message = `Hello *${employeeName}*,\n\n` +
                `Aapke complete karne ke liye niche diye gaye tasks assign kiye gaye hain. Kripya details aur Target Date ke mutabik update karein:\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  tasksList.forEach((task, index) => {
    const baseUpdateLink = `https://delegation-sheet.vercel.app/update-status?taskId=${task.id}`;
    message += `*️⃣ *Task Number:* ${index + 1}\n` +
               `👤 *Employee Name:* ${employeeName}\n` +
               `📅 *Target Date:* ${task.deadline || 'N/A'}\n` +
               `📝 *Task Detail:* ${task.title}\n` +
               `🔗 *Status Update Link:* ${baseUpdateLink}\n` +
               `----------------------------------------\n\n`;
  });

  message += `_(Note: Agar link blue na ho, toh pehle chat me "OK" likh kar reply karein)_`;

  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId: `${targetPhone}@c.us`, message }) });
  } catch (err) { console.error(err); }
};