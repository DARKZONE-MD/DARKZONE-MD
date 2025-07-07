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
    if (!q || !q.startsWith("http")) {
      return reply("🔗 *Please provide a valid Facebook URL*\n\nExample: `.fb https://www.facebook.com/...`\n\n⚠️ URL must start with http or https");
    }

    // Add loading reaction
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // RapidAPI configuration
    const options = {
      method: 'GET',
      url: 'https://facebook-realtimeapi.p.rapidapi.com/facebook/video', // Updated endpoint
      params: {
        url: encodeURIComponent(q),
        hd: 'true'
      },
      headers: {
        'x-rapidapi-host': 'facebook-realtimeapi.p.rapidapi.com',
        'x-rapidapi-key': '8f8214432dmshe2d6730ba6b5541p119a35jsna12406472100'
      },
      timeout: 30000 // 30 seconds timeout
    };

    // Fetch video data from RapidAPI
    const response = await axios.request(options);
    const videoData = response.data;

    // Validate API response
    if (!videoData || (!videoData.hd_url && !videoData.sd_url)) {
      return reply("🚫 *Download Failed*\n\nPossible reasons:\n• Invalid or private video\n• API quota exceeded\n• Video not available\n\nTry again later or use a different URL.");
    }

    // Create stylish caption
    const caption = `⬇️ *Facebook Video Downloaded* ⬇️\n\n` +
                   `🆔 *Bot Owner:* ERFAN AHMAD\n` +
                   `⚡ *Quality:* ${videoData.hd_url ? 'HD' : 'SD'}\n` +
                   `🔗 *Source:* ${q}\n\n` +
                   `💾 Long press to save`;

    // Send the video with enhanced design
    await conn.sendMessage(from, {
      video: { url: videoData.hd_url || videoData.sd_url },
      caption: caption,
      contextInfo: {
        externalAdReply: {
          title: "Facebook Video Downloader Pro",
          body: "High Quality Video Download",
          thumbnail: await axios.get('https://i.imgur.com/2HeTWHa.png', { 
            responseType: 'arraybuffer',
            timeout: 10000
          }).then(res => res.data).catch(() => null),
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
    let errorMsg = "⚠️ *Download Error* ⚠️\n\n";

    if (error.response) {
      // Handle API errors
      if (error.response.status === 429) {
        errorMsg += "🔴 *API Limit Reached!*\nTry again after some time.";
      } else if (error.response.status === 404) {
        errorMsg += "🔍 *Video Not Found*\nCheck URL or video privacy settings.";
      } else {
        errorMsg += `API Error: ${error.response.status} - ${error.response.statusText}`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMsg += "⏳ *Request Timeout*\nServer took too long to respond.";
    } else {
      errorMsg += "❌ *Unexpected Error*\nPlease try again later.";
    }

    await reply(errorMsg);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
