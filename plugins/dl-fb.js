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
    // Check if a URL is provided
    if (!q || !q.match(/facebook\.com|fb\.watch/)) {
      return reply("⚠️ *Please provide a valid Facebook URL*\n\nExample: `.fb https://www.facebook.com/...`\nOr: `.fb https://fb.watch/...`");
    }

    // Add loading reaction
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // API endpoints (multiple fallbacks)
    const apis = [
      `https://api.samirthakuri.repl.co/api/videofb?url=${encodeURIComponent(q)}`,
      `https://api.lolhuman.xyz/api/facebook?apikey=YOUR_API_KEY&url=${encodeURIComponent(q)}`,
      `https://www.velyn.biz.id/api/downloader/facebookdl?url=${encodeURIComponent(q)}`
    ];

    let videoUrl;
    let errorCount = 0;

    // Try each API until we get a working video
    for (const api of apis) {
      try {
        const { data } = await axios.get(api, { timeout: 15000 });
        
        if (data.result || data.url || data.data?.url) {
          videoUrl = data.result || data.url || data.data.url;
          break;
        }
      } catch (e) {
        errorCount++;
        console.log(`API ${errorCount} failed, trying next...`);
      }
    }

    if (!videoUrl) {
      return reply("❌ All download methods failed. Please try another link or try again later.");
    }

    // Send the video with progress tracking
    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: "🎥 *Facebook Video Downloaded*\n\n🔹 *Quality:* HD\n🔹 *Powered By:* 𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟\n🔹 *Bot Name:* " + (config.BOT_NAME || "YourBot"),
      contextInfo: {
        externalAdReply: {
          title: "Facebook Video Downloader",
          body: "Successfully downloaded!",
          thumbnail: await (await axios.get('https://i.imgur.com/8K7VhJt.jpg', { responseType: 'arraybuffer' })).data,
          mediaType: 2,
          mediaUrl: '',
          sourceUrl: ''
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error("Facebook DL Error:", error);
    reply("⚠️ *Download Failed*\n\nPossible reasons:\n1. Invalid URL\n2. Private video\n3. Server busy\n\nTry again or use another link.");
  }
});
