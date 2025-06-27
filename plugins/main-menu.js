const config = require('../config');
const { cmd } = require('../command');
const path = require('path');
const fs = require('fs');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu2",
    alias: ["menu"],
    desc: "Download menu with button",
    category: "menu",
    react: "📥",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Menu Text
        let menuText = `
╭━━〔 🚀 ${config.BOT_NAME} 〕━━┈⊷
┃◈ Owner: ${config.OWNER_NAME}
┃◈ Prefix: [${config.PREFIX}]
┃◈ Runtime: ${runtime(process.uptime())}
╰━━━━━━━━━━━━━━━━━━━┈⊷

📌 Click the button below for download options!`;

        // Download Button
        const buttons = [
            {
                buttonId: `${config.PREFIX}download`,
                buttonText: { displayText: '📥 DOWNLOAD MENU' },
                type: 1
            }
        ];

        // Download Commands (shown when button is clicked)
        let downloadCommands = `
╭━━〔 📥 DOWNLOAD COMMANDS 〕━━┈⊷
┃◈ facebook [url]
┃◈ tiktok [url] 
┃◈ insta [url]
┃◈ youtube [url]
┃◈ spotify [url]
┃◈ song [name]
╰━━━━━━━━━━━━━━━━━━━┈⊷
Type ${config.PREFIX}command for usage`;

        // Send Interactive Message
        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL || 'https://i.imgur.com/abc123.jpg' },
                caption: menuText,
                footer: "Tap the button below",
                buttons: buttons,
                headerType: 4
            },
            { quoted: mek }
        );

        // Optional: Send audio
        const audioPath = path.join(__dirname, '../assets/menu.m4a');
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(
                from,
                { 
                    audio: fs.readFileSync(audioPath),
                    mimetype: 'audio/mp4'
                },
                { quoted: mek }
            );
        }

    } catch (e) {
        console.error("Menu Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
