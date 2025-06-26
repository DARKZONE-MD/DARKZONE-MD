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
╭───「 ✨ *${config.BOT_NAME || "DARKZONE-MD"}* ✨ 」───
│
│ 👑 *Owner:* ${config.OWNER_NAME || "Erfan Ahmad"}
│ ⚡ *Prefix:* [${config.PREFIX || "."}]
│ 🕒 *Runtime:* ${runtime(process.uptime())}
│
╰─────────────────────`

        // Create all button sections
        const buttonSections = [
            // DOWNLOAD MENU
            {
                title: "📥 DOWNLOAD MENU",
                rows: [
                    { title: "🔵 Facebook", rowId: `${config.PREFIX}fb` },
                    { title: "🎵 Tiktok", rowId: `${config.PREFIX}tiktok` },
                    { title: "📷 Instagram", rowId: `${config.PREFIX}insta` },
                    { title: "🐦 Twitter", rowId: `${config.PREFIX}twitter` }
                ]
            },
            // GROUP MENU
            {
                title: "👥 GROUP MENU",
                rows: [
                    { title: "👢 Kick", rowId: `${config.PREFIX}kick` },
                    { title: "⬆️ Promote", rowId: `${config.PREFIX}promote` },
                    { title: "@ Tag All", rowId: `${config.PREFIX}tagall` },
                    { title: "🎉 Welcome", rowId: `${config.PREFIX}setwelcome` }
                ]
            },
            // OWNER MENU
            {
                title: "👑 OWNER MENU",
                rows: [
                    { title: "👑 Owner", rowId: `${config.PREFIX}owner` },
                    { title: "🔄 Restart", rowId: `${config.PREFIX}restart` },
                    { title: "🚫 Block", rowId: `${config.PREFIX}block` },
                    { title: "✅ Unblock", rowId: `${config.PREFIX}unblock` }
                ]
            },
            // FUN MENU
            {
                title: "🎉 FUN MENU",
                rows: [
                    { title: "😆 Joke", rowId: `${config.PREFIX}joke` },
                    { title: "💘 Ship", rowId: `${config.PREFIX}ship` },
                    { title: "⭐ Rate", rowId: `${config.PREFIX}rate` },
                    { title: "🤬 Insult", rowId: `${config.PREFIX}insult` }
                ]
            },
            // AI MENU
            {
                title: "🤖 AI MENU",
                rows: [
                    { title: "🧠 AI", rowId: `${config.PREFIX}ai` },
                    { title: "🤖 GPT", rowId: `${config.PREFIX}gpt` },
                    { title: "🎨 Imagine", rowId: `${config.PREFIX}imagine` },
                    { title: "🔍 Bing", rowId: `${config.PREFIX}bing` }
                ]
            }
        ]

        // Send the main menu with buttons
        await conn.sendMessage(from, {
            text: header,
            footer: "DARKZONE-MD | Multi-Device WhatsApp Bot",
            title: "BOT MENU",
            buttonText: "Click Here For Commands",
            sections: buttonSections,
            mentions: [sender]
        }, { quoted: mek })

        // Optional: Send menu image
        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/71l0oz.jpg' },
            caption: "✨ *DARKZONE-MD Bot Menu* ✨"
        }, { quoted: mek })

    } catch (e) {
        console.error("Menu Error:", e)
        reply(`❌ Error loading menu: ${e.message}`)
    }
})
