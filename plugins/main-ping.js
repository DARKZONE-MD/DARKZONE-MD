const config = require('../config');
const { cmd, commands } = require('../command');

// Array of different fancy text styles for DARKZONE-MD
const botNameStyles = [
    "𝘿𝘼𝙍𝙆𝙕𝙊𝙉𝙀-𝙈𝘿",
    "𝔇𝔄𝔯𝔨𝔷𝔬𝔫𝔢-𝔐𝔇",
    "🅳🅰🆁🅺🆉🅾🅽🅴-🅼🅳",
    "𝐃𝐀𝐑𝐊𝐙𝐎𝐍𝐄-𝐌𝐃",
    "𝓓𝓐𝓡𝓚𝓩𝓞𝓝𝓔-𝓜𝓓",
    "𝒟𝒜𝑅𝒦𝒵𝒪𝒩𝐸-𝑀𝒟",
    "𝖉𝖆𝖗𝖐𝖟𝖔𝖓𝖊-𝖒𝖉",
    "ＤＡＲＫＺＯＮＥ-ＭＤ",
    "𝕯𝕬𝕽𝕶𝖅𝕺𝕹𝕰-𝕸𝕯",
    "𝙳𝙰𝚁𝙺𝚉𝙾𝙽𝙴-𝙼𝙳"
];

// Track current style index
let currentStyleIndex = 0;

cmd({
    pattern: "ping",
    alias: ["speed","pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "🌡️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        // Ensure reaction and text emojis are different
        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        // Send reaction using conn.sendMessage()
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        // Get current fancy bot name and rotate for next time
        const fancyBotName = botNameStyles[currentStyleIndex];
        currentStyleIndex = (currentStyleIndex + 1) % botNameStyles.length;

        const text = `> *${fancyBotName} SPEED: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363416743041101@newsletter',
                    newsletterName: "𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

// ping2 remains unchanged
cmd({
    pattern: "ping2",
    desc: "Check bot's response time.",
    category: "main",
    react: "🍂",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const startTime = Date.now()
        const message = await conn.sendMessage(from, { text: '*PINGING...*' })
        const endTime = Date.now()
        const ping = endTime - startTime
        await conn.sendMessage(from, { text: `*🔥 DARKZONE-MD SPEED : ${ping}ms*` }, { quoted: message })
    } catch (e) {
        console.log(e)
        reply(`${e}`)
    }
})
