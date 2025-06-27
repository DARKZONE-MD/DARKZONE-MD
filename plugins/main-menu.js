const config = require('../config');
const { cmd } = require('../command');
const path = require('path');
const fs = require('fs');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu2",
    alias: ["menu"],
    desc: "Show download menu",
    category: "menu",
    react: "📥",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Menu Header
        let menuHeader = `
╭━━〔 🚀 ${config.BOT_NAME} 〕━━┈⊷
┃◈ Owner: ${config.OWNER_NAME}
┃◈ Prefix: [${config.PREFIX}]
┃◈ Runtime: ${runtime(process.uptime())}
╰━━━━━━━━━━━━━━━━━━━┈⊷`;

        // Create Download Button
        const buttonMessage = {
            text: menuHeader,
            footer: "Tap the button below for download options!",
            buttons: [
                { buttonId: `${config.PREFIX}download`, buttonText: { displayText: '📥 DOWNLOAD' }, type: 1 }
            ],
            headerType: 1
        };

        // Send the message
        await conn.sendMessage(from, buttonMessage, { quoted: mek });

        console.log("Menu sent successfully!"); // Debug log

    } catch (e) {
        console.error("Menu Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
