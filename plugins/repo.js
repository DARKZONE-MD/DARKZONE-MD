const axios = require('axios');
const { cmd } = require('../command');
const fs = require('fs');
const os = require('os');

// Read package version
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = pkg.version || "1.0.0";

// Uptime formatter
function formatUptime(ms) {
    let sec = Math.floor((ms / 1000) % 60);
    let min = Math.floor((ms / (1000 * 60)) % 60);
    let hr = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${hr}h ${min}m ${sec}s`;
}

// Count commands (plugin files)
const commandCount = Object.keys(require.cache)
    .filter(path => path.includes('/commands/') || path.includes('\\commands\\'))
    .length;

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Show KEENLY XMD repository details",
    category: "main",
    react: "👨‍💻",
    filename: __filename
},
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        // GitHub repo stats
        const { data } = await axios.get('https://api.github.com/repos/Obedweb/KEENLY-XMD');
        const { stargazers_count, forks_count } = data;
        const users = Math.round((stargazers_count + forks_count) * 5); // ×5 stats

        const uptime = formatUptime(process.uptime() * 1000);
        const platform = os.platform().toUpperCase();
        const arch = os.arch().toUpperCase();

        const msg = `
┏━━━『 *👨‍💻 KEENLY XMD Info* 』━━━✦
┃ 🔗 *Repo*: 
┃   github.com/Obedweb/KEENLY-XMD
┃ 
┃ ⭐ *Stars*: ${stargazers_count}
┃ 🍴 *Forks*: ${forks_count}
┃ 👥 *Est. Users*: ${users}
┃ 
┃ ⚙️ *Version*: v${version}
┃ 📊 *Commands*: ${commandCount}
┃ 🕓 *Uptime*: ${uptime}
┃ 💽 *System*: ${platform} (${arch})
┗━━━━━━━━━━━━━━━━━━━━━━✦

✨ *KEENLY XMD* – your feature-packed WhatsApp bot for automation, fun, and more!

📌 *Main MD Repo*:
https://github.com/Obedweb/KEENLY-XMD

💡 *Tip*: Fork & ⭐ to show love!
💖 Thanks for choosing KEENLY XMD!
        `.trim();

        const contextTag = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363416335506023@newsletter',
                newsletterName: '𝙺𝙴𝙴𝙽𝙻𝚈 𝚇𝙼𝙳 💖🦄',
                serverMessageId: 143
            }
        };

        // Send the repo stats text with forward tag
        await conn.sendMessage(from, {
            text: msg,
            contextInfo: contextTag
        }, { quoted: mek });

        // Send a related image with forward tag
        await conn.sendMessage(from, {
            image: { url: `https://files.catbox.moe/9yic1a.jpg` },
            caption: "🌟 *𝙺𝙴𝙴𝙽𝙻𝚈 𝚇𝙼𝙳: Powering smart chats everywhere!*",
            contextInfo: contextTag
        }, { quoted: mek });

        // Send the audio response (voice note)
        await conn.sendMessage(from, {
            audio: { url: 'https://files.catbox.moe/gq9uht.mp3' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

    } catch (err) {
        console.error("❌ Repo Fetch Error:", err);
        reply(`🚫 *Error fetching repo data:*\n${err.message}`);
    }
});
