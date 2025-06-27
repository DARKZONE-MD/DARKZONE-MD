const config = require('../config')
const { cmd } = require('../command');
const path = require('path');
const fs = require('fs');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu2",
    alias: ["menu"],
    desc: "Interactive menu with buttons",
    category: "menu",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Main Menu Text
        let menuText = `
╭━━〔 🚀 *${config.BOT_NAME}* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 👑 Owner : *${config.OWNER_NAME}*
┃◈┃• ⚙️ Prefix : *[${config.PREFIX}]*
┃◈┃• ⏱️ Runtime : *${runtime(process.uptime())}*
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

📌 *Click buttons below for quick access!*`;

        // Interactive Buttons (MAIN COMMANDS)
        const buttons = [
            { buttonId: `${config.PREFIX}owner`, buttonText: { displayText: "👑 Owner" }, type: 1 },
            { buttonId: `${config.PREFIX}download`, buttonText: { displayText: "📥 Download" }, type: 1 },
            { buttonId: `${config.PREFIX}vote`, buttonText: { displayText: "⭐ Vote" }, type: 1 },
            { buttonId: `${config.PREFIX}group`, buttonText: { displayText: "👥 Group" }, type: 1 },
            { buttonId: `${config.PREFIX}ai`, buttonText: { displayText: "🤖 AI" }, type: 1 },
            { buttonId: `${config.PREFIX}fun`, buttonText: { displayText: "🎉 Fun" }, type: 1 }
        ];

        // All Other Commands (as text)
        let commandsText = `
╭━━〔 📜 *ALL COMMANDS* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🎵 tiktok
┃◈┃• 🐦 twitter
┃◈┃• 📷 insta
┃◈┃• 🖼️ sticker
┃◈┃• 🎭 anime
┃◈┃• 🎨 logo
┃◈┃• 🧠 gpt
┃◈┃• 🎲 joke
┃◈┃• ℹ️ fact
┃◈╰─────────────────┈⊷
> ${config.DESCRIPTION}`;

        // Send Interactive Message
        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL || 'https://i.imgur.com/3xZQZ9x.jpeg' },
                caption: menuText + commandsText,
                footer: "Tap buttons to execute commands!",
                buttons: buttons,
                headerType: 4
            },
            { quoted: mek }
        );

        // Optional: Send Menu Audio
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
        reply(`❌ Menu failed. Error: ${e.message}`);
    }
});
