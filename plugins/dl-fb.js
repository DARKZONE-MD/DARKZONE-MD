const axios = require("axios");
const { cmd } = require("../command");
const config = require("../config"); // Make sure you have this

cmd({
  pattern: "fb",
  alias: ["facebook", "fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename,
  use: "<Facebook URL>",
}, async (Void, citel, text, { from }) => {
  try {
    // Validate URL
    if (!text || !text.match(/(facebook\.com|fb\.watch)/i)) {
      return citel.reply(`❌ *Invalid Facebook URL!*\n\nExample: .fb https://www.facebook.com/...\nOr: .fb https://fb.watch/...`);
    }

    // Show processing message
    await citel.reply("🔄 Processing your video... Please wait!");

    // List of working APIs (updated June 2024)
    const apis = [
      {
        url: `https://api.erdwpe.com/api/downloader/facebook?url=${encodeURIComponent(text)}`,
        getVideoUrl: (data) => data.result?.hd || data.result?.sd
      },
      {
        url: `https://api.violetics.pw/api/downloader/facebook?apikey=beta&url=${encodeURIComponent(text)}`,
        getVideoUrl: (data) => data.result?.url
      },
      {
        url: `https://api.lolhuman.xyz/api/facebook?apikey=${config.LOLHUMAN_KEY || 'YOUR_API_KEY'}&url=${encodeURIComponent(text)}`,
        getVideoUrl: (data) => data.result
      }
    ];

    let videoUrl;
    let lastError;

    // Try each API until success
    for (const api of apis) {
      try {
        const { data } = await axios.get(api.url, { timeout: 20000 });
        videoUrl = api.getVideoUrl(data);
        if (videoUrl) break;
      } catch (e) {
        lastError = e;
        console.log(`API failed: ${api.url}`);
      }
    }

    if (!videoUrl) {
      console.error("All APIs failed:", lastError);
      return citel.reply(`❌ Download failed!\nPossible reasons:\n1. Private video\n2. Copyright content\n3. Invalid URL\n\nTry again later or use different link.`);
    }

    // Send the video
    await Void.sendMessage(from, {
      video: { url: videoUrl },
      caption: `📥 *Facebook Video Downloaded*\n\n🔹 *Quality:* HD\n🔹 *Powered By:* 𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟\n🔹 *Bot:* ${config.BOT_NAME || "YourBot"}`,
      contextInfo: {
        externalAdReply: {
          title: "Facebook Video Downloader",
          body: "Download successful!",
          thumbnail: (await axios.get('https://i.imgur.com/8K7VhJt.jpg', { responseType: 'arraybuffer' })).data,
          mediaType: 2,
          sourceUrl: ''
        }
      }
    }, { quoted: citel });

  } catch (error) {
    console.error("FB Download Error:", error);
    citel.reply("⚠️ An unexpected error occurred. Please try again later.");
  }
});
