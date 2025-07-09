const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "fb",
  alias: ["facebook", "fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename,
  use: "<Facebook URL>",
}, async (conn, m, store, { from, args, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("*`Need a valid Facebook URL`*\n\nExample: `.fb https://www.facebook.com/...`");
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // New API endpoint (you can change this if you get another working one)
    const apiUrl = `https://api.akuari.my.id/downloader/fb2?link=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.respon || !data.respon[0]?.url) {
      return reply("❌ Failed to fetch the video. Try another link.");
    }

    const videoUrl = data.respon[0].url;

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: "📥 *Facebook Video Downloaded*\n\n- Powered by Bot 🤖",
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ Error fetching the video. Please try again.");
  }
});
