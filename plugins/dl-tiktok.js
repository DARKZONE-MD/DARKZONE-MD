const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "tt",
  alias: ["tiktok", "ttdl"],
  react: "📥",
  desc: "Download TikTok video",
  category: "download",
  use: ".tt <TikTok URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const url = args[0];
    if (!url || !url.includes("tiktok.com")) {
      return reply("❌ Please provide a valid TikTok video URL.\n\nExample:\n.tt https://vt.tiktok.com/...");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result || !data.result.length) {
      return reply("❌ Video not found or unavailable.");
    }

    const video = data.result[0]; // First available video link
    const meta = data.metadata || {};
    const author = meta.author || "Unknown";
    const caption = meta.caption ? meta.caption.slice(0, 300) + "..." : "No caption provided.";

    await conn.sendMessage(from, {
      video: { url: video },
      caption: `🎬 *TikTok Downloader*\n👤 *Author:* ${author}\n💬 *Caption:* ${caption}\n\n> It's ERFAN AHMAD 💯`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("tt Error:", err);
    reply("❌ Failed to download TikTok video. Please try again later.");
    await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
  }
});

////==========TikTok2===================

const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "tt2",
  alias: ["tiktok2", "ttdl2"],
  react: '📥',
  desc: "Download TikTok videos",
  category: "download",
  use: ".tt2 <TikTok URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const url = args[0];
    if (!url || !url.includes("tiktok.com")) {
      return reply("❌ Please provide a valid TikTok video URL.\n\nExample:\n.tt2 https://vt.tiktok.com/...");
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    const author = data?.metadata?.author || {};
    const video = Array.isArray(data?.result) && data.result[0];

    if (!data.status || !video) {
      const caption = `❌ Video not found or unavailable.\n\n👤 Author: ${author.nickname || "Unknown"}\n🆔 @${author.uniqueId || "unknown"}`;
      if (author.avatarThumb) {
        await conn.sendMessage(from, {
          image: { url: author.avatarThumb },
          caption
        }, { quoted: mek });
      } else {
        return reply(caption);
      }
      return;
    }

    await conn.sendMessage(from, {
      video: { url: video },
      caption: `🎬 *TikTok Video Downloader v3*\n👤 *User:* ${author.nickname || "User"}\n🆔 *@${author.uniqueId || "unknown"}*\n\n> IT'S ERFAN AHMAD 🥺`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (err) {
    console.error("tt2 Error:", err);
    reply("❌ Something went wrong. Please try again later.");
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
