const axios = require("axios");
const ytSearch = require("yt-search");
const { cmd } = require("../command");

cmd({
  pattern: "audio3",
  alias: ["spotify", "ytmusic", "play"],
  react: "🎵",
  desc: "Fetch audio from Spotify or YouTube",
  category: "media",
  filename: __filename
}, async (client, message, details, context) => {
  const { from, q, reply } = context;

  if (!q) return reply("❌ What song do you want to download?");
  reply("🔄 *Keenly xmd Bot fetching your audio...*\n\n*Please wait...* 🎧");

  try {
    let search = await ytSearch(q);
    let video = search.videos[0];
    if (!video) return reply("❌ No results found. Please refine your search.");

    let link = video.url;
    let apis = [
      `https://apis.davidcyriltech.my.id/youtube/mp3?url=${link}`,
      `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${link}`
    ];

    for (const api of apis) {
      try {
        let { data } = await axios.get(api);
        if (data.status === 200 || data.success) {
          let audioUrl = data.result?.downloadUrl || data.url;
          let songData = {
            title: data.result?.title || video.title,
            artist: data.result?.author || video.author.name,
            thumbnail: data.result?.image || video.thumbnail,
            videoUrl: link
          };

          await client.sendMessage(from, {
            image: { url: songData.thumbnail },
            caption: `KEENLY THE KEENLY XMD BOT\n╭═════════════════⊷\n║ 🎶 *Title:* ${songData.title}\n║ 🎤 *Artist:* ${songData.artist}\n║ 🔗 *No URL Sharing*\n╰═════════════════⊷\n*Powered by KEENLY XMD BOT*`
          });

          reply("📤 *Sending your audio...* 🎼");

          await client.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mp4"
          });

          reply("📤 *Sending your MP3 file...* 🎶");

          await client.sendMessage(from, {
            document: { url: audioUrl },
            mimetype: "audio/mp3",
            fileName: `${songData.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`
          });

          reply("✅ *Keenly xmd – World-class bot just successfully sent you what you requested! 🎶*");
          return;
        }
      } catch (e) {
        console.error(`API Error (${api}):`, e.message);
        continue;
      }
    }

    reply("⚠️ An error occurred. All APIs might be down or unable to process the request.");
  } catch (error) {
    reply("❌ Download failed\n" + error.message);
  }
});
