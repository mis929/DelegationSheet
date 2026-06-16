export const sendWhatsAppAlert = async (phoneNumber, taskId, taskTitle, deadline) => {
  const idInstance = "YOUR_ID_INSTANCE"; 
  const apiTokenInstance = "YOUR_API_TOKEN_INSTANCE";
  
  const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

  // Yeh link employee ko seedhe status change karne wale page par le jayega
  const actionLink = `http://localhost:5173/update-status?taskId=${taskId}`;

  const message = `🚀 *Naya Task Assign Hua Hai!* \n\n` +
                  `*Task ID:* ${taskId}\n` +
                  `*Task Name:* ${taskTitle}\n` +
                  `*Deadline:* ${deadline}\n\n` +
                  `📥 *Task ko Accept ya Complete karne ke liye niche link par click karein:* \n` +
                  `${actionLink}`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: `${phoneNumber}@c.us`,
        message: message,
      }),
    });
    console.log("Task details aur action link WhatsApp par bhej diya gaya h!");
  } catch (error) {
    console.error("WhatsApp notification failed:", error);
  }
};