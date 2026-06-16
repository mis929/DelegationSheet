const GREEN_API_ID = "7107628437"; 
const GREEN_API_TOKEN = "7196edcfec4149228a084c62b7eabc4da111f13c430c416887"; 
export const triggerWhatsAppAlert = async (phone, taskTitle, points, deadline, taskId) => {
  if (!phone) return;
  
  let cleanPhone = String(phone).replace(/\D/g, "");
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const url = `https://api.green-api.com/waInstance${GREEN_API_ID}/sendMessage/${GREEN_API_TOKEN}`;
  
  // ⚡ LINK TRICK: Localhost ko ngrok ya local IP se access karein, ya direct link bhejein
  // Agar aap mobile par test kar rahe hain, toh localhost ki jagah apne laptop ka IP address dalein (Jaise: 192.168.1.5)
  const baseLink = "http://localhost:5173/update-status";
  const fullStatusLink = `${baseLink}?taskId=${taskId}`;
  
  let message = `📌 *ACTION REQUIRED: NEW TASK ASSIGNED* 📌\n\n` +
                `*Task:* ${taskTitle}\n` +
                `*Points:* ⭐ ${points} Pts\n` +
                `*Target Date:* 📅 ${deadline}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `⚠️ *TASK KO UPDATE/COMPLETE KARNE KE LIYE NICHE DIYE GAYE LINK PAR CLICK KAREIN:* ⚠️\n\n` +
                `${fullStatusLink}\n\n` +
                `_(Agar upar wala link click na ho, toh pehle is chat me "OK" ya "Hi" likh kar reply karein)_`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        chatId: `${targetPhone}@c.us`, 
        message: message 
      })
    });
    
    const result = await response.json();
    console.log("Green API Broadcast Success:", result);
  } catch (err) {
    console.error("WhatsApp Link Generator Error:", err);
  }
};