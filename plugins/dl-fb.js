const axios = require("axios");
const { cmd } = require("../command");
const fs = require("fs");
const FormData = require("form-data");

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
    if (!q || !q.includes("facebook.com")) {
      return reply("📌 *Invalid URL Format*\n\nPlease send a valid Facebook video URL\nExample: `.fb https://www.facebook.com/.../video/...`");
    }

    // Add loading reaction
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Using a free and reliable API
    const apiUrl = `https://fbdownloader.net/api/ajaxSearch`;
    const formData = new FormData();
    formData.append('q', q);
    
    const { data } = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    // Check if download links are available
    if (!data.links || !data.links.hd || !data.links.sd) {
      return reply("❌ *No Download Links Found*\n\nThis video may be private or restricted\nTry another public video link");
    }

    // Send the video (try HD first, fallback to SD)
    const videoUrl = data.links.hd || data.links.sd;
    const caption = `⬇️ *Facebook Video Downloaded* \n\n` +
                   `🔹 *Quality:* ${data.links.hd ? 'HD' : 'SD'}\n` +
                   `🔹 *Duration:* ${data.duration || 'N/A'}\n` +
                   `🔹 *Size:* ${data.size || 'N/A'}\n\n` +
                   `🤖 *Powered by Your Bot Name*`;

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: caption,
      contextInfo: {
        externalAdReply: {
          title: "Facebook Video Downloader",
          body: "Successfully downloaded!",
          thumbnail: await axios.get('https://i.ibb.co/7n1k3Pj/fb-thumb.jpg', { responseType: 'arraybuffer' })
                              .then(res => res.data)
                              .catch(() => null),
          mediaType: 1,
          sourceUrl: q,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

    // Add success reaction
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    let errorMsg = "❌ *Download Failed* \n\n";
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMsg += "Video not found. The link may be broken or private.";
      } else if (error.response.status === 403) {
        errorMsg += "Access denied. The video may be age-restricted or private.";
      } else {
        errorMsg += `Server error (${error.response.status}). Try again later.`;
      }
    } else if (error.code === 'ECONNREFUSED') {
      errorMsg += "Service unavailable. Please try again later.";
    } else {
      errorMsg += "An unexpected error occurred. Check your link and try again.";
    }
    
    await reply(errorMsg);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
