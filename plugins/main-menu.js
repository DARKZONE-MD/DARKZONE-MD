const config = require('../config')
const { cmd, commands } = require('../command');
const path = require('path'); 
const os = require("os")
const fs = require('fs');
const {runtime} = require('../lib/functions')
const axios = require('axios')

cmd({
    pattern: "menu2",
    alias: ["allmenu","fullmenu"],
    use: '.menu2',
    desc: "Show all bot commands",
    category: "menu",
    react: "📜",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Main menu buttons
        const buttons = [
            {buttonId: `${config.PREFIX}downloadmenu`, buttonText: {displayText: '📥 DOWNLOAD'}, type: 1},
            {buttonId: `${config.PREFIX}groupmenu`, buttonText: {displayText: '👥 GROUP'}, type: 1},
            {buttonId: `${config.PREFIX}reactmenu`, buttonText: {displayText: '🎭 REACTIONS'}, type: 1},
            {buttonId: `${config.PREFIX}logomenu`, buttonText: {displayText: '🎨 LOGO MAKER'}, type: 1},
            {buttonId: `${config.PREFIX}ownermenu`, buttonText: {displayText: '👑 OWNER'}, type: 1},
            {buttonId: `${config.PREFIX}funmenu`, buttonText: {displayText: '🎉 FUN'}, type: 1},
            {buttonId: `${config.PREFIX}convertmenu`, buttonText: {displayText: '🔄 CONVERT'}, type: 1},
            {buttonId: `${config.PREFIX}aimenu`, buttonText: {displayText: '🤖 AI'}, type: 1},
            {buttonId: `${config.PREFIX}animemenu`, buttonText: {displayText: '🎎 ANIME'}, type: 1},
            {buttonId: `${config.PREFIX}othermenu`, buttonText: {displayText: 'ℹ️ OTHER'}, type: 1}
        ]

        const buttonMessage = {
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/r2ncqh' },
            caption: `╭━━〔 🚀 *${config.BOT_NAME}* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 👑 Owner : *${config.OWNER_NAME}*
┃◈┃• ⚙️ Prefix : *[${config.PREFIX}]*
┃◈┃• 🌐 Platform : *Heroku*
┃◈┃• 📦 Version : *4.0.0*
┃◈┃• ⏱️ Runtime : *${runtime(process.uptime())}*
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

Click the buttons below to navigate to different menus`,
            footer: `Powered by ${config.OWNER_NAME}`,
            buttons: buttons,
            headerType: 4,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }

        await conn.sendMessage(from, buttonMessage, { quoted: mek });

        // Share local audio
        const audioPath = path.join(__dirname, '../assets/menu.m4a');
        await conn.sendMessage(from, {
            audio: fs.readFileSync(audioPath),
            mimetype: 'audio/mp4',
            ptt: true,
        }, { quoted: mek });
        
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e}`);
    }
});

// Individual menu handlers
cmd({
    pattern: "downloadmenu",
    desc: "Download menu",
    category: "menu",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    const downloadMenu = `╭━━〔 📥 *DOWNLOAD MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🟦 facebook
┃◈┃• 📁 mediafire
┃◈┃• 🎵 tiktok
┃◈┃• 🐦 twitter
┃◈┃• 📷 insta
┃◈┃• 📦 apk
┃◈┃• 🖼️ img
┃◈┃• ▶️ tt2
┃◈┃• 📌 pins
┃◈┃• 🔄 apk2
┃◈┃• 🔵 fb2
┃◈┃• 📍 pinterest
┃◈┃• 🎶 spotify
┃◈┃• 🎧 play
┃◈┃• 🎧 play2
┃◈┃• 🔉 audio
┃◈┃• 🎬 video
┃◈┃• 📹 video2
┃◈┃• 🎵 ytmp3
┃◈┃• 📹 ytmp4
┃◈┃• 🎶 song
┃◈┃• 🎬 darama
┃◈┃• ☁️ gdrive
┃◈┃• 🌐 ssweb
┃◈┃• 🎵 tiks
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷`;

    await reply(downloadMenu);
});

// Add similar handlers for other menus (groupmenu, reactmenu, etc.)
// Each menu should have its own command handler like the downloadmenu above
