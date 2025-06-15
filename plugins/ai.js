const { cmd } = require('../command');
const axios = require('axios');

let aiNoticeSent = new Set(); // Track users who already got the link

// Hidden (encoded) owner link
const hiddenLink = Buffer.from("aHR0cHM6Ly93YS5tZS9tZXNzYWdlLzJZTFdXQkFISzdFRUgx", "base64").toString("utf-8");

cmd({
  pattern: "ai",
  alias: ["bot", "dj", "gpt", "gpt4", "bing"],
  desc: "Chat with an AI model",
  category: "ai",
  react: "🤖",
  filename: __filename
},
async (conn, mek, m, { from, sender, args, q, reply, react }) => {
  try {
    if (!q) return reply("🤖 Please ask something for the AI to respond.\nExample: `.ai Hello`");

    // Show hidden owner link only once per user
    if (!aiNoticeSent.has(sender)) {
      aiNoticeSent.add(sender);
      await reply(`📢 Contact the bot owner: ${hiddenLink}\n`);
    }

    const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.message) {
      await react("❌");
      return reply("⚠️ AI failed to respond. Please try again later.");
    }

    await reply(`🤖 *AI Response:*\n\n${data.message}`);
    await react("✅");

  } catch (e) {
    console.error("AI Command Error:", e);
    await react("❌");
    reply("⚠️ An error occurred while talking to the AI.");
  }
});
    
