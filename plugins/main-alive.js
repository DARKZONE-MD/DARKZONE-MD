const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const status = `
╭───〔 *🤖 ${config.BOT_NAME} STATUS* 〕───◉
│✨ *Bot is Active & Online!*
│
│🎯 *Status:* *Active & Running!*
│👑 *Owner:* *ERFAN*
│⚡ *Version:* 4.0.0
│🔮 *Prefix:* [ . ]
╰───────────────◇
╭───────────────◇
│🖥️ *System Info:*
│• *CPU: Intel(R) Xeon(R) Platinum 8375C CPU*
│• *RAM: 57.41/63276.47 MB*
│• *Free: 36992.82 MB*
│• *Platform: linux x64*
│⏱️ *Uptime:* 3 *hours*, 2 *minutes*, 42 *seconds*
╰───────────────◇
> ${config.DESCRIPTION}`;

        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363416743041101@newsletter',
                    newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
