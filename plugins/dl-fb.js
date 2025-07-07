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
      return reply("📌 *Please provide a valid Facebook URL*\n\nExample: `.fb https://www.facebook.com/...`\n\n🔗 URL should start with http or https");
    }

    // Add a loading react
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Options for RapidAPI
    const options = {
      method: 'GET',
      url: 'https://facebook-realtimeapi.p.rapidapi.com/facebook/video',
      params: {
        url: q,
        hd: 'true'
      },
      headers: {
        'x-rapidapi-host': 'facebook-realtimeapi.p.rapidapi.com',
        'x-rapidapi-key': '8f8214432dmshe2d6730ba6b5541p119a35jsna12406472100'
      }
    };

    // Fetch video data from RapidAPI
    const response = await axios.request(options);
    const data = response.data;

    // Check if API response is valid
    if (!data || !data.hd_url) {
      return reply("❌ *Download Failed*\n\nPossible reasons:\n1. Invalid or private video URL\n2. API limit reached\n3. Video is too long\n\nTry another link or try again later.");
    }

    // Send the video with nice caption and design
    const caption = `🎥 *Facebook Video Downloader*\n\n` +
                   `✓ *HD Quality Available*\n` +
                   `✓ *Powered by RapidAPI*\n` +
                   `✓ *Bot maintained by ERFAN AHMAD*\n\n` +
                   `📥 Click to download`;

    await conn.sendMessage(from, {
      video: { url: data.hd_url || data.sd_url },
      caption: caption,
      contextInfo: {
        externalAdReply: {
          title: "Facebook Video Downloader",
          body: "HD Quality Video",
          thumbnail: await axios.get('https://i.imgur.com/2HeTWHa.png', { responseType: 'arraybuffer' }).then(res => res.data),
          mediaType: 1,
          mediaUrl: '',
          sourceUrl: q,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

    // Add success react
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    let errorMessage = "❌ *Download Error*\n\n";
    
    if (error.response) {
      if (error.response.status === 429) {
        errorMessage += "API limit reached. Please try again later.";
      } else if (error.response.status === 404) {
        errorMessage += "Video not found. Check the URL and try again.";
      } else {
        errorMessage += `Server responded with status ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage += "No response from API server. Check your connection.";
    } else {
      errorMessage += "An unexpected error occurred.";
    }
    
    await reply(errorMessage);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
