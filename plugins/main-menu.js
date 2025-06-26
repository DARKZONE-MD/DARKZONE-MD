const config = require('../config')
const { cmd } = require('../command')
const fs = require('fs')
const path = require('path')
const { runtime } = require('../lib/functions')

cmd({
    pattern: "menu2",
    alias: ["allmenu", "fullmenu"],
    desc: "Show all bot commands",
    category: "menu",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        // System information
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
        const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2)
        const uptime = runtime(process.uptime())

        // Create the header with bot info
        const header = `
╭───「 ✨ *${config.BOT_NAME || "DARKZONE-MD"}* ✨ 」───
│
│ ⏱️ *Runtime:* ${uptime}
│ 👑 *Owner:* @${config.OWNER_NAME || "MR MANUL"}
│ 💾 *Memory:* ${memoryUsage}MB / ${totalMemory}MB
│
╰─────────────────────`

        // Create all button sections
        const sections = [
            // MAIN MENU
            {
                title: "⚡ MAIN MENU",
                rows: [
                    { title: "🏓 Ping", rowId: `${config.PREFIX}ping` },
                    { title: "💚 Alive", rowId: `${config.PREFIX}alive` },
                    { title: "📊 Speed", rowId: `${config.PREFIX}speed` },
                    { title: "📡 Live", rowId: `${config.PREFIX}live` }
                ]
            },
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
            }
        ]

        // Send the interactive button menu
        await conn.sendMessage(from, {
            text: header,
            footer: "Powered By - @MR MANUL | OFC",
            title: "COMMANDS PANEL",
            buttonText: "CLICK FOR COMMANDS ▼",
            sections: sections,
            mentions: [sender]
        }, { quoted: mek })

        // Optional: Send menu image
        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/71l0oz.jpg' },
            caption: "✨ *DARKZONE-MD Bot Menu* ✨"
        }, { quoted: mek })

    } catch (e) {
        console.error("Menu Error:", e)
        reply(`❌ Error loading menu: ${e.message}`)
    }
})
