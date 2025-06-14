const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["status", "runtime", "uptime"],
    desc: "Check uptime and system status",
    category: "main",
    react: "⌚",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Generate system status message
        const status = `╭━━〔 *✦ 𝙆𝙀𝙀𝙉𝙇𝙔 𝙓𝙈𝘿 ✦* 〕━━┈⊷
┃🦄╭─────────────·๏
┃🦄┃• *⏳Uptime*:  ${runtime(process.uptime())} 
┃🦄┃• *📟 Ram usage*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}GB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}TB
┃🦄┃• *⚙️ HostName*: ${os.hostname()}
┃🦄┃• *👨‍💻 Owner*: ᴏʙᴇᴅᴛᴇᴄʜ
┃🦄┃• *🧬 Version*: 6.0.0
✦ 𝙆𝙀𝙀𝙉𝙇𝙔 𝙓𝙈𝘿 ✦
╰──────────────┈⊷
> © ✦ 𝙆𝙀𝙀𝙉𝙇𝙔 𝙓𝙈𝘿 ✦`;

        // Send the status message with an image
        await conn.sendMessage(from, { 
            image: { url: `https://files.catbox.moe/9yic1a.jpg` },  
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363416335506023@newsletter',
                    newsletterName: '𝙆𝙀𝙀𝙉𝙇𝙔 𝙓𝙈𝘿🎄',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in alive command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
