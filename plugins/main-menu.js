const config = require('../config')
const { cmd, commands } = require('../command');
const path = require('path'); 
const fs = require('fs');
const {runtime} = require('../lib/functions')

cmd({
    pattern: "menu2",
    alias: ["allmenu","fullmenu"],
    use: '.menu2',
    desc: "Show all bot commands",
    category: "menu",
    react: "📜",
    filename: __filename
}, 
async (conn, mek, m, { from, reply }) => {
    try {
        // Main menu buttons
        const buttons = [
            {buttonId: `${config.PREFIX}downloadmenu`, buttonText: {displayText: '📥 DOWNLOAD'}, type: 1},
            {buttonId: `${config.PREFIX}groupmenu`, buttonText: {displayText: '👥 GROUP'}, type: 1},
            {buttonId: `${config.PREFIX}reactmenu`, buttonText: {displayText: '🎭 REACTIONS'}, type: 1},
            {buttonId: `${config.PREFIX}logomenu`, buttonText: {displayText: '🎨 LOGO MAKER'}, type: 1},
            {buttonId: `${config.PREFIX}ownermenu`, buttonText: {displayText: '👑 OWNER'}, type: 1}
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
            headerType: 4
        }

        await conn.sendMessage(from, buttonMessage, { quoted: mek });

        // Audio file handling with error checking
        try {
            const audioPath = path.join(__dirname, '../assets/menu.m4a');
            if (fs.existsSync(audioPath)) {
                await conn.sendMessage(from, {
                    audio: fs.readFileSync(audioPath),
                    mimetype: 'audio/mp4',
                    ptt: true,
                }, { quoted: mek });
            } else {
                console.log('Audio file not found, skipping audio message');
            }
        } catch (audioError) {
            console.log('Error sending audio:', audioError);
        }
        
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});
