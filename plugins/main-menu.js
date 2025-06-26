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
        const buttonSections = [
            {
                title: "📥 DOWNLOAD MENU",
                rows: [
                    { title: "🔵 Facebook", rowId: `${config.PREFIX}fb` },
                    { title: "🎵 Tiktok", rowId: `${config.PREFIX}tiktok` },
                    { title: "📷 Instagram", rowId: `${config.PREFIX}insta` },
                    { title: "🐦 Twitter", rowId: `${config.PREFIX}twitter` }
                ]
            },
            {
                title: "👥 GROUP MENU",
                rows: [
                    { title: "👢 Kick", rowId: `${config.PREFIX}kick` },
                    { title: "⬆️ Promote", rowId: `${config.PREFIX}promote` },
                    { title: "@ Tag All", rowId: `${config.PREFIX}tagall` },
                    { title: "🎉 Welcome", rowId: `${config.PREFIX}setwelcome` }
                ]
            },
            {
                title: "🎨 CREATIVE MENU",
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

        // Send the button menu
        await conn.sendMessage(from, {
            text: header,
            footer: config.DESCRIPTION || "Powered by Erfan Ahmad",
            title: "BOT COMMAND MENU",
            buttonText: "CLICK FOR COMMANDS ▼",
            sections: buttonSections,
            mentions: [sender]
        }, { quoted: mek })

        // Optional: Send menu image
        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || '' },
            caption: "✨ *Bot Menu* ✨"
        }, { quoted: mek })

    } catch (e) {
        console.error("Menu Error:", e)
        reply(`❌ Error loading menu: ${e.message}`)
    }
})
