const config = require('../config')
const { cmd } = require('../command');
const path = require('path');
const fs = require('fs');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu2",
    alias: ["menu", "allmenu"],
    desc: "Show interactive menu with buttons",
    category: "menu",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Menu Text
        let menuText = `
╭━━〔 🚀 *${config.BOT_NAME}* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 👑 Owner : *${config.OWNER_NAME}*
┃◈┃• ⚙️ Prefix : *[${config.PREFIX}]*
┃◈┃• ⏱️ Runtime : *${runtime(process.uptime())}*
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

📌 *Click buttons below for quick actions!*`;

        // Buttons (Main Commands)
        const buttons = [
            {
                buttonId: `${config.PREFIX}download`,
                buttonText: { displayText: '📥 Download' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}owner`,
                buttonText: { displayText: '👑 Owner' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}vote`,
                buttonText: { displayText: '⭐ Vote' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}group`,
                buttonText: { displayText: '👥 Group' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}ai`,
                buttonText: { displayText: '🤖 AI' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}fun`,
                buttonText: { displayText: '🎉 Fun' },
                type: 1
            }
        ];

        // Footer Text (Other Commands)
        let footerText = `
╭━━〔 🔍 *Other Commands* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🎵 tiktok
┃◈┃• 🐦 twitter
┃◈┃• 📷 insta
┃◈┃• 🖼️ sticker
┃◈┃• 🎭 anime
┃◈┃• 🎨 logo
┃◈╰─────────────────┈⊷
> ${config.DESCRIPTION}`;

        // Send Interactive Message (Buttons + Image)
        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/r2ncqh' },
                caption: menuText + footerText,
                footer: "Tap a button to run command!",
                buttons: buttons,
                headerType: 4
            },
            { quoted: mek }
        );

        // Send Menu Audio (Optional)
        const audioPath = path.join(__dirname, '../assets/menu.m4a');
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(
                from,
                { 
                    audio: fs.readFileSync(audioPath), 
                    mimetype: 'audio/mp4', 
                    ptt: true 
                },
                { quoted: mek }
            );
        }
    } catch (e) {
        console.error("Menu Error:", e);
        reply(`❌ Menu failed to load. Error: ${e.message}`);
    }
});
