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
        // Main Menu Text (Non-Button)
        let menuText = `
╭━━〔 🚀 *${config.BOT_NAME}* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 👑 Owner : *${config.OWNER_NAME}*
┃◈┃• ⚙️ Prefix : *[${config.PREFIX}]*
┃◈┃• 🌐 Platform : *Heroku*
┃◈┃• 📦 Version : *4.0.0*
┃◈┃• ⏱️ Runtime : *${runtime(process.uptime())}*
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*📌 Click a button below or type command manually!*`;

        // Buttons (Main Commands)
        const buttons = [
            { buttonId: `${config.PREFIX}download`, buttonText: { displayText: '📥 Download' }, type: 1 },
            { buttonId: `${config.PREFIX}owner`, buttonText: { displayText: '👑 Owner' }, type: 1 },
            { buttonId: `${config.PREFIX}vote`, buttonText: { displayText: '⭐ Vote' }, type: 1 },
            { buttonId: `${config.PREFIX}group`, buttonText: { displayText: '👥 Group' }, type: 1 },
            { buttonId: `${config.PREFIX}ai`, buttonText: { displayText: '🤖 AI' }, type: 1 },
            { buttonId: `${config.PREFIX}fun`, buttonText: { displayText: '🎉 Fun' }, type: 1 }
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
┃◈┃• 🧠 gpt
┃◈┃• 🎲 joke
┃◈┃• ℹ️ fact
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`;

        // Send Image + Buttons + Text
        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/r2ncqh' },
                caption: menuText + footerText,
                footer: "Click buttons for quick actions!",
                buttons: buttons,
                headerType: 4,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            },
            { quoted: mek }
        );

        // Share Menu Audio (Optional)
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
