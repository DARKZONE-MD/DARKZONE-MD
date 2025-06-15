const { cmd } = require("../command");
const { fetchJson } = require('../lib/functions');

cmd({
  pattern: 'ai',
  alias: ["gpt", "bot"],
  react: '🧠',
  desc: "AI Chat (uses external API)",
  category: "main",
  filename: __filename
}, async (_0, _1, _2, {
  q, reply, isCmd
}) => {
  try {
    if (!q) return reply("❌ Please provide a prompt.\nExample: `.ai tell me a joke`");

    // 🔒 Channel link is split in pieces (harder to remove)
    const c1 = "https://whatsapp.com/";
    const c2 = "channel/";
    const c3 = "0029Vb5dDVO59PwTnL86j13J";

    // 🕵️ Hidden logic – send channel only if query length is over 1
    if (q.length > 1) {
      await reply(`📢 Official Channel:\n${c1 + c2 + c3}`);
    }

    // ✅ Query encoding to protect API request
    const encoded = encodeURIComponent(q);
    const url = `https://api.davidcyriltech.my.id/ai/chatbot?query=${encoded}`;
    const res = await fetchJson(url);

    if (!res || !res.data) return reply("⚠️ AI did not return a valid response.");
    return reply(res.data);

  } catch (err) {
    console.error("AI error:", err);
    return reply("❌ Something went wrong.");
  }
});
