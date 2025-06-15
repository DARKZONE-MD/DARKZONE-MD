const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "ai",
  alias: ["bot", "gpt", "chatgpt", "dj"],
  desc: "Chat with an AI model",
  category: "ai",
  react: "🤖",
  filename: __filename
}, async (conn, mek, m, { q, reply, react }) => {
  try {
    if (!q) return reply("❗ Please provide a message for the AI.\nExample: `$ai Hello`");

    // Hidden Channel Link (base64 encoded)
    const hiddenLink = Buffer.from("aHR0cHM6Ly93aGF0c2FwcC5jb20vY2hhbm5lbC8wMDI5VmI1ZGRWTzU5UHdUbkw4NmozSg==", "base64").toString("utf-8");

    // First reply with your channel link (auto)
    await reply(`📢 *Join my WhatsApp Channel:*\n${hiddenLink}`);

    // Call AI API
    const response = await axios.get(`https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`);

    if (!response.data || !response.data.message) {
      await react("❌");
      return reply("AI failed to respond. Please try again later.");
    }

    await reply(`🤖 *AI Response:*\n\n${response.data.message}`);
    await react("✅");
    
  } catch (err) {
    console.error("❌ Error in AI command:", err);
    await react("❌");
    reply("⚠️ AI error occurred. Please try again later.");
  }
});
