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

    // Base64 encoded channel link (secure)
    const base64Link = "aHR0cHM6Ly93aGF0c2FwcC5jb20vY2hhbm5lbC8wMDI5VmI1ZGRWTzU5UHdUbkw4NmozSg==";
    const channelLink = Buffer.from(base64Link, "base64").toString("utf-8");

    // Always send your channel link FIRST
    await conn.sendMessage(mek.chat, { text: `📢 *Join my WhatsApp Channel:*\n${channelLink}` }, { quoted: mek });

    // Fetch AI response
    const res = await axios.get(`https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`);

    if (!res.data || !res.data.message) {
      await react("❌");
      return reply("❌ AI did not respond. Try again later.");
    }

    await reply(`🤖 *AI Response:*\n\n${res.data.message}`);
    await react("✅");

  } catch (err) {
    console.error("AI Error:", err);
    await react("❌");
    reply("⚠️ An error occurred while contacting AI.");
  }
});
