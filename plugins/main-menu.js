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
        const sections = [
            // DOWNLOAD MENU
            {
                title: "📥 DOWNLOAD MENU",
                rows: [
                    { title: "🔵 Facebook", rowId: `${config.PREFIX}fb` },
                    { title: "🎵 Tiktok", rowId: `${config.PREFIX}tiktok` },
                    { title: "📷 Instagram", rowId: `${config.PREFIX}insta` },
                    { title: "🐦 Twitter", rowId: `${config.PREFIX}twitter` },
                    { title: "📦 Mediafire", rowId: `${config.PREFIX}mediafire` }
                ]
            },
            // GROUP MENU
            {
                title: "👥 GROUP MENU",
                rows: [
                    { title: "👢 Kick", rowId: `${config.PREFIX}kick` },
                    { title: "⬆️ Promote", rowId: `${config.PREFIX}promote` },
                    { title: "@ Tag All", rowId: `${config.PREFIX}tagall` },
                    { title: "🎉 Welcome", rowId: `${config.PREFIX}setwelcome` },
                    { title: "🔗 Group Link", rowId: `${config.PREFIX}grouplink` }
                ]
            },
            // OWNER MENU
            {
                title: "👑 OWNER MENU",
                rows: [
                    { title: "👑 Owner", rowId: `${config.PREFIX}owner` },
                    { title: "🔄 Restart", rowId: `${config.PREFIX}restart` },
                    { title: "🚫 Block", rowId: `${config.PREFIX}block` },
                    { title: "✅ Unblock", rowId: `${config.PREFIX}unblock` },
                    { title: "💚 Alive", rowId: `${config.PREFIX}alive` }
                ]
            },
            // FUN MENU
            {
                title: "🎉 FUN MENU",
                rows: [
                    { title: "😆 Joke", rowId: `${config.PREFIX}joke` },
                    { title: "💘 Ship", rowId: `${config.PREFIX}ship` },
                    { title: "⭐ Rate", rowId: `${config.PREFIX}rate` },
                    { title: "🤬 Insult", rowId: `${config.PREFIX}insult` },
                    { title: "💋 Kiss", rowId: `${config.PREFIX}kiss` }
                ]
            },
            // AI MENU
            {
                title: "🤖 AI MENU",
                rows: [
                    { title: "🧠 AI", rowId: `${config.PREFIX}ai` },
                    { title: "🤖 GPT", rowId: `${config.PREFIX}gpt` },
                    { title: "🎨 Imagine", rowId: `${config.PREFIX}imagine` },
                    { title: "🔍 Bing", rowId: `${config.PREFIX}bing` },
                    { title: "📦 Blackbox", rowId: `${config.PREFIX}blackbox` }
                ]
            },
            // LOGO MENU
            {
                title: "🎨 LOGO MENU",
                rows: [
                    { title: "💡 Neon", rowId: `${config.PREFIX}neonlight` },
                    { title: "🎀 Blackpink", rowId: `${config.PREFIX}blackpink` },
                    { title: "🐉 Dragonball", rowId: `${config.PREFIX}dragonball` },
                    { title: "🎭 3D Comic", rowId: `${config.PREFIX}3dcomic` },
                    { title: "🌌 Galaxy", rowId: `${config.PREFIX}galaxy` }
                ]
            }
        ]

        // Send the interactive button menu
        await conn.sendMessage(from, {
            text: header,
            footer: "DARKZONE-MD | Multi-Device WhatsApp Bot",
            title: "BOT COMMAND MENU",
            buttonText: "Click For Commands",
            sections: sections,
            mentions: [sender]
        }, { quoted: mek })

        // Optional: Send menu image
        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/71l0oz.jpg' },
            caption: "✨ *DARKZONE-MD Bot Menu* ✨"
        }, { quoted: mek })

        // Optional: Send audio menu
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
