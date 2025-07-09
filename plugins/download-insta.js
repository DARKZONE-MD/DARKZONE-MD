const axios = require("axios");
const { cmd } = require("../command");

// Instagram Downloader 
cmd({
  pattern: "ig",
  alias: ["instagram5", "ig", "instadl5"],
  react: '📥',
  desc: "Download videos from Instagram (API v5)",
  category: "download",
  use: ".ig <Instagram video URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const igUrl = args[0];
    if (!igUrl || !igUrl.includes("instagram.com")) {
      return reply('❌ Please provide a valid Instagram video URL.\n\nExample:\n.ig https://instagram.com/reel/...');
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(igUrl)}`;
    const response = await axios.get(apiUrl);

    const data = response.data;

    if (!data.status || !data.result || !Array.isArray(data.result)) {
      return reply('❌ Unable to fetch the video. Please check the URL and try again.');
    }

    const videoUrl = data.result[0];
    if (!videoUrl) return reply("❌ No video found in the response.");

    const metadata = data.metadata || {};
    const author = metadata.author || "Unknown";
    const caption = metadata.caption ? metadata.caption.slice(0, 300) + "..." : "No caption provided.";
    const likes = metadata.like || 0;
    const comments = metadata.comment || 0;

    await reply('Downloading Instagram video... Please wait.📥');

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: `📥 *Instagram Reel Downloader v5*\n👤 *Author:* ${author}\n💬 *Caption:* ${caption}\n❤️ *Likes:* ${likes} | 💭 *Comments:* ${comments}\n\n> IT'S ERFAN AHMAD 😔`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('ig Error:', error);
    reply('❌ Failed to download the Instagram video. Please try again later.');
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
