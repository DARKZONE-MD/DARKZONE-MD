const config = require('../config')
const { cmd, commands } = require('../command');
const path = require('path'); 
const os = require("os")
const fs = require('fs');
const { runtime } = require('../lib/functions')
const axios = require('axios')

cmd({
    pattern: "menu2",
    alias: ["allmenu", "fullmenu"],
    desc: "Show all bot commands with buttons",
    category: "menu",
    react: "📜",
    filename: __filename
}, 
async (conn, mek, m, { from, sender, reply }) => {
    try {
        // Header with bot info
        const header = `
╭───「 ✨ *${config.BOT_NAME}* ✨ 」───
│
│ 👑 *Owner:* ${config.OWNER_NAME}
│ ⚡ *Prefix:* [${config.PREFIX}]
│ 🕒 *Runtime:* ${runtime(process.uptime())}
│
╰─────────────────────`;

        // Create button sections
        const buttons = [
            {
                title: "📥 DOWNLOAD MENU",
                rows: [
                    { title: "🎵 Tiktok", description: "Download tiktok videos", rowId: `${config.PREFIX}tiktok` },
                    { title: "🔵 Facebook", description: "Download facebook videos", rowId: `${config.PREFIX}fb` },
                    { title: "📷 Instagram", description: "Download instagram content", rowId: `${config.PREFIX}insta` },
                    { title: "🐦 Twitter", description: "Download twitter videos", rowId: `${config.PREFIX}twitter` }
                ]
            },
            {
                title: "👥 GROUP MENU",
                rows: [
                    { title: "👢 Kick", description: "Remove member from group", rowId: `${config.PREFIX}kick` },
                    { title: "⬆️ Promote", description: "Make member admin", rowId: `${config.PREFIX}promote` },
                    { title: "🎉 Welcome", description: "Set welcome message", rowId: `${config.PREFIX}setwelcome` },
                    { title: "@ Tag All", description: "Mention all members", rowId: `${config.PREFIX}tagall` }
                ]
            },
            {
                title: "🎨 CREATIVE MENU",
                rows: [
                    { title: "💡 Neon Logo", description: "Create neon text logo", rowId: `${config.PREFIX}neonlight` },
                    { title: "🎭 Comic Logo", description: "3D comic style text", rowId: `${config.PREFIX}3dcomic` },
                    { title: "🌌 Galaxy Logo", description: "Galaxy style text", rowId: `${config.PREFIX}galaxy` },
                    { title: "🏷️ Sticker", description: "Convert image to sticker", rowId: `${config.PREFIX}sticker` }
                ]
            },
            {
                title: "⚡ UTILITIES",
                rows: [
                    { title: "🏓 Ping", description: "Check bot speed", rowId: `${config.PREFIX}ping` },
                    { title: "💚 Alive", description: "Check bot status", rowId: `${config.PREFIX}alive` },
                    { title: "🔍 Search", description: "Search anything", rowId: `${config.PREFIX}ai` },
                    { title: "📜 Full Menu", description: "See all commands", rowId: `${config.PREFIX}allmenu` }
                ]
            }
        ];

        // Send interactive message with buttons
        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/71l0oz.jpg' },
            caption: header,
            footer: config.DESCRIPTION || "A powerful WhatsApp bot",
            templateButtons: buttons,
            viewOnce: true,
            mentions: [sender]
        }, { quoted: mek });

        // Send audio if available
        try {
            const audioPath = path.join(__dirname, '../assets/menu.m4a');
            if (fs.existsSync(audioPath)) {
                await conn.sendMessage(from, {
                    audio: { url: audioPath },
                    mimetype: 'audio/mp4',
                    ptt: true
                }, { quoted: mek });
            }
        } catch (audioError) {
            console.log("Audio send error:", audioError);
        }

    } catch (e) {
        console.error("Menu Error:", e);
        reply(`❌ Error loading menu: ${e.message}`);
    }
});
