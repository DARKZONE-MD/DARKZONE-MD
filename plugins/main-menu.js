const config = require('../config');
const { cmd } = require('../command');
const path = require('path');
const fs = require('fs');
const { runtime } = require('../lib/functions');

// Main Menu Command
cmd({
    pattern: "menu2",
    alias: ["menu"],
    desc: "Interactive button menu",
    category: "menu",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Main Menu with Buttons
        const menuMessage = {
            text: `╭━━〔 🚀 *${config.BOT_NAME}* 〕━━┈⊷
┃◈ Owner: *${config.OWNER_NAME}*
┃◈ Prefix: *[${config.PREFIX}]*
┃◈ Runtime: *${runtime(process.uptime())}*
╰━━━━━━━━━━━━━━━━━━━┈⊷

📌 *Select a category below:*`,
            footer: config.DESCRIPTION,
            buttons: [
                { buttonId: 'download_menu', buttonText: { displayText: '📥 DOWNLOAD' }, type: 1 },
                { buttonId: 'group_menu', buttonText: { displayText: '👥 GROUP' }, type: 1 },
                { buttonId: 'fun_menu', buttonText: { displayText: '🎉 FUN' }, type: 1 }
            ],
            headerType: 1
        };

        await conn.sendMessage(from, menuMessage, { quoted: mek });

        // Optional: Send menu audio
        const audioPath = path.join(__dirname, '../assets/menu.m4a');
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(from, { 
                audio: fs.readFileSync(audioPath),
                mimetype: 'audio/mp4'
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Menu Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Button Handler
conn.ev.on('messages.upsert', async ({ messages }) => {
    try {
        const m = messages[0];
        if (!m.message?.buttonsResponseMessage) return;

        const buttonId = m.message.buttonsResponseMessage.selectedButtonId;
        const from = m.key.remoteJid;

        // Download Menu
        if (buttonId === 'download_menu') {
            await conn.sendMessage(from, {
                text: `╭━━〔 📥 *DOWNLOAD COMMANDS* 〕━━┈⊷
┃◈ • facebook [url]
┃◈ • tiktok [url]
┃◈ • insta [url]
┃◈ • youtube [url]
┃◈ • spotify [url]
┃◈ • song [name]
╰━━━━━━━━━━━━━━━━━━━┈⊷
Type ${config.PREFIX}command for usage`,
                footer: "Download media from various platforms"
            }, { quoted: m });
        }

        // Group Menu
        else if (buttonId === 'group_menu') {
            await conn.sendMessage(from, {
                text: `╭━━〔 👥 *GROUP COMMANDS* 〕━━┈⊷
┃◈ • add @user
┃◈ • kick @user
┃◈ • promote @user
┃◈ • demote @user
┃◈ • lockgc
┃◈ • unlockgc
┃◈ • tagall
╰━━━━━━━━━━━━━━━━━━━┈⊷
Admin-only commands marked with *`,
                footer: "Group management tools"
            }, { quoted: m });
        }

        // Fun Menu
        else if (buttonId === 'fun_menu') {
            await conn.sendMessage(from, {
                text: `╭━━〔 🎉 *FUN COMMANDS* 〕━━┈⊷
┃◈ • joke
┃◈ • meme
┃◈ • quote
┃◈ • fact
┃◈ • hug @user
┃◈ • kiss @user
╰━━━━━━━━━━━━━━━━━━━┈⊷
Fun commands to enjoy!`,
                footer: "Entertainment commands"
            }, { quoted: m });
        }

    } catch (e) {
        console.error("Button Handler Error:", e);
    }
});
