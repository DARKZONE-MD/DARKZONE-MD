const config = require('../config')
const { cmd } = require('../command')
const fs = require('fs')
const path = require('path')
const { runtime } = require('../lib/functions')

cmd({
    pattern: "menu2",
    alias: ["allmenu", "fullmenu"],
    desc: "Show all bot commands with buttons",
    category: "menu",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        // Header with bot info
        const header = `
╭───「 ✨ *${config.BOT_NAME || "YourBot"}* ✨ 」───
│
│ 👑 *Owner:* ${config.OWNER_NAME || "Erfan Ahmad"}
│ ⚡ *Prefix:* [${config.PREFIX || "."}]
│ 🕒 *Runtime:* ${runtime(process.uptime())}
│
╰─────────────────────`

        // Create button sections
        const buttons = [
            {
                title: "📥 DOWNLOAD",
                rows: [
                    { title: "🔵 Facebook", rowId: `${config.PREFIX}fb` },
                    { title: "🎵 Tiktok", rowId: `${config.PREFIX}tiktok` },
                    { title: "📷 Instagram", rowId: `${config.PREFIX}insta` },
                    { title: "🐦 Twitter", rowId: `${config.PREFIX}twitter` }
                ]
            },
            {
                title: "👥 GROUP",
                rows: [
                    { title: "👢 Kick", rowId: `${config.PREFIX}kick` },
                    { title: "⬆️ Promote", rowId: `${config.PREFIX}promote` },
                    { title: "@ Tag All", rowId: `${config.PREFIX}tagall` },
                    { title: "🎉 Welcome", rowId: `${config.PREFIX}setwelcome` }
                ]
            },
            {
                title: "🎨 CREATIVE",
                rows: [
                    { title: "💡 Neon Logo", rowId: `${config.PREFIX}neonlight` },
                    { title: "🏷️ Sticker", rowId: `${config.PREFIX}sticker` },
                    { title: "🌌 Galaxy", rowId: `${config.PREFIX}galaxy` },
                    { title: "🎭 Comic", rowId: `${config.PREFIX}3dcomic` }
                ]
            },
            {
                title: "⚡ UTILITIES",
                rows: [
                    { title: "🏓 Ping", rowId: `${config.PREFIX}ping` },
                    { title: "💚 Alive", rowId: `${config.PREFIX}alive` },
                    { title: "🔍 AI", rowId: `${config.PREFIX}ai` },
                    { title: "📜 Full Menu", rowId: `${config.PREFIX}allmenu` }
                ]
            }
        ]

        // Send interactive message with buttons
        await conn.sendMessage(from, {
            text: header,
            footer: config.DESCRIPTION || "Powered by Erfan Ahmad",
            templateButtons: buttons,
            mentions: [sender]
        }, { quoted: mek })

        // Optional: Send menu image if you want
        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/71l0oz.jpg' },
            caption: "✨ *Bot Menu* ✨"
        }, { quoted: mek })

        // Optional: Send audio if available
        const audioPath = path.join(__dirname, '../assets/menu.m4a')
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(from, {
                audio: { url: audioPath },
                mimetype: 'audio/mp4'
            }, { quoted: mek })
        }

    } catch (e) {
        console.error("Menu Error:", e)
        reply(`❌ Error loading menu: ${e.message}`)
    }
})
