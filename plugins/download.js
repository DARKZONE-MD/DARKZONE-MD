const fetch = require('node-fetch');
const { cmd } = require('../command');

cmd({
    pattern: "download",
    alias: ["dl", "getvideo"],
    desc: "Download videos from Facebook, Instagram, TikTok, Twitter/X, and more",
    react: "⬇️",
    category: "media",
    filename: __filename,
    use: '.download <video_url>'
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) {
            return reply(`📥 *Video Downloader Help* 📥

🔹 *Usage:* .download <video_url>
🔹 *Supported Platforms:*
   - TikTok
   - Instagram (Reels/Posts)
   - Facebook
   - Twitter/X
   - YouTube (Shorts)

✨ *Example:* 
.download https://www.tiktok.com/@user/video/123456789

⚡ *Powered by DARKZONE-MD*`);
        }

        const url = args[0].trim();
        await reply('🔍 *Processing your link...* ⏳');

        // API endpoint with your provided key
        const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data || data.error) {
            return reply(`❌ *Download Failed!* ❌\n\n${data?.message || 'Invalid link or unsupported platform'}\n\nPlease try another link.`);
        }

        // Determine platform from URL
        const getPlatform = () => {
            if (url.includes('tiktok')) return 'TikTok';
            if (url.includes('instagram')) return 'Instagram';
            if (url.includes('facebook') || url.includes('fb.watch')) return 'Facebook';
            if (url.includes('twitter') || url.includes('x.com')) return 'Twitter/X';
            if (url.includes('youtube') || url.includes('youtu.be')) return 'YouTube';
            return 'Social Media';
        };

        // Stylish message template
        const platform = getPlatform();
        const caption = `╔═══ *${platform.toUpperCase()} DOWNLOAD* ════
║
╠➤ *Platform:* ${platform}
╠➤ *Quality:* ${data.quality || 'HD'}
╠➤ *Duration:* ${data.duration || 'N/A'}
╠➤ *Server:* DARKZONE-MD
║
╚═══ *Powered By ERFAN AHMAD* ═══`;

        if (data.videoUrl) {
            // Send video with caption
            await conn.sendMessage(from, {
                video: { url: data.videoUrl },
                caption: caption,
                mimetype: 'video/mp4'
            }, { quoted: mek });
        } else if (data.images && data.images.length > 0) {
            // Handle Instagram carousel posts
            for (const imgUrl of data.images) {
                await conn.sendMessage(from, {
                    image: { url: imgUrl },
                    caption: caption
                }, { quoted: mek });
            }
        } else {
            reply('⚠️ *No downloadable media found*');
        }

    } catch (error) {
        console.error('Download Error:', error);
        reply(`❌ *Error Occurred!* ❌\n\n${error.message}\n\nPlease try again later or contact owner.`);
    }
});
