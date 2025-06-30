const fetch = require("node-fetch");
const { cmd } = require("../command");

cmd({
  pattern: "tiktok",
  alias: ["dl", "get"],
  desc: "Download videos from TikTok, Facebook, YouTube, or Instagram",
  react: '⬇️',
  category: 'tools',
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  if (!args[0]) {
    return reply(`📥 *Download Command Help*\n
🔹 *Usage:* .download <url>
🔹 *Supported Platforms:*
   - TikTok
   - Facebook
   - YouTube (shorts)
   - Instagram (reels/posts)

🌐 *Example:* .download https://tiktok.com/@user/video/123456789`);
  }

  const url = args[0];
  await reply("🔍 Analyzing your link... Please wait ⏳");

  try {
    const apiUrl = `https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || data.error) {
      return reply("❌ Error: " + (data.message || "Failed to download video. Invalid link or unsupported platform."));
    }

    // Stylish response format
    const platform = getPlatformName(url);
    const caption = `╔═══ *${platform.toUpperCase()} DOWNLOAD* ═══
║
╠➤ *Platform:* ${platform}
╠➤ *Quality:* ${data.quality || 'HD'}
╠➤ *Duration:* ${data.duration || 'N/A'}
║
╚═══ *DARKZONE-MD* ═══`;

    if (data.videoUrl) {
      await conn.sendMessage(from, {
        video: { url: data.videoUrl },
        caption: caption,
        mimetype: 'video/mp4'
      }, { quoted: mek });
    } else if (data.images) {
      // Handle Instagram carousel posts
      for (const imgUrl of data.images) {
        await conn.sendMessage(from, {
          image: { url: imgUrl },
          caption: caption
        }, { quoted: mek });
      }
    } else {
      reply("❌ No downloadable content found in the response.");
    }

  } catch (error) {
    console.error("Download Error:", error);
    reply(`❌ Download failed: ${error.message}\n\nPlease make sure you've provided a valid URL.`);
  }
});

// Helper function to detect platform from URL
function getPlatformName(url) {
  if (/tiktok\.com/i.test(url)) return "TikTok";
  if (/facebook\.com|fb\.watch/i.test(url)) return "Facebook";
  if (/youtube\.com|youtu\.be/i.test(url)) return "YouTube";
  if (/instagram\.com/i.test(url)) return "Instagram";
  return "Social Media";
}

// Add similar commands for each platform if needed
cmd({
  pattern: "tiktok",
  alias: ["tt", "tiktokdl"],
  desc: "Download TikTok videos directly",
  react: '🎵',
  category: 'tools',
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  if (!args[0]) return reply("Please provide a TikTok URL\nExample: .tiktok https://vm.tiktok.com/xyz");
  m.args = [args[0]]; // Forward to download command
  require('./download').commands[0].function(conn, mek, m);
});
