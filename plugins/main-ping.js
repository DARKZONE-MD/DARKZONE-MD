const config = require('../config');
const { cmd, commands } = require('../command');

// Store to remember user's last used style
const userStyles = new Map();

// 10 Different Ping Designs
const pingDesigns = [
    (speed) => `╔═══════❖═══════╗\n║  ⚡ DARKZONE-MD ⚡  ║\n║  Speed: ${speed}ms  ║\n╚═══════❖═══════╝\n📢 Join our channel!\nhttps://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J`,
    (speed) => `┏━━━━━━━━━━━━━\n┃ 🚀 *DARKZONE PING* 🚀\n┃ ➤ Speed: ${speed}ms\n┗━━━━━━━━━━━━━\n🌟 Channel: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J`,
    (speed) => `▄▀▄▀▄ DARKZONE ▄▀▄▀▄\n⚡ Speed: ${speed}ms\n🔹 Channel: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J`,
    (speed) => `✧･ﾟ: *✧ DARKZONE ✧* :･ﾟ✧\n❖ Speed: ${speed}ms\n❖ Stay updated: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J`,
    (speed) => `╭─⊱❀⊰─╮\n│  💎 DARKZONE 💎  │\n│  ⏱️ ${speed}ms  │\n╰─⊱❀⊰─╯\n📡 Channel: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J`,
    (speed) => `▰▰▰▰▰▰▰▰▰\n   DARKZONE-MD\n▰▰▰▰▰▰▰▰▰\n⚡ Speed: ${speed}ms\n🔔 Channel: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J`,
    (speed) => `✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧\n   DARKZONE PING\n✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧\n⏱️ ${speed}ms\n📢 Join us: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J`,
    (speed) => `◈◈◈◈◈◈◈◈◈\n   DARKZONE-MD\n◈◈◈◈◈◈◈◈◈\n🚀 ${speed}ms\n🔹 Channel: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J`,
    (speed) => `✦✧✦✧✦✧✦✧✦\n  DARKZONE PING\n✦✧✦✧✦✧✦✧✦\n⚡ ${speed}ms\n📡 Updates: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J`,
    (speed) => `▣▣▣▣▣▣▣▣▣\n   DARKZONE SPEED TEST\n▣▣▣▣▣▣▣▣▣\n⏱️ ${speed}ms\n💎 Channel: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J`
];

// Fancy text styles
const fancyStyles = [
    (text) => text, // Normal
    (text) => text.split('').map(c => c + '⃝').join(''), 
    (text) => text.split('').map(c => c + '⃞').join(''),
    (text) => text.split('').map(c => c + '⃟').join(''),
    (text) => text.toUpperCase(),
    (text) => text.split('').join(' '),
    (text) => text.split('').map(c => c + '̲').join(''),
    (text) => text.split('').map(c => c + '̶').join(''),
    (text) => text.split('').map(c => c + '̷').join(''),
    (text) => text.split('').map(c => c + '̸').join('')
];

cmd({
    pattern: "ping",
    alias: ["speed","pong"],
    use: '.ping',
    desc: "Check bot's response time with stylish responses",
    category: "main",
    react: "🌡️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();
        const user = sender.split('@')[0];

        // Get or increment user's style index
        let styleIndex = userStyles.get(user) || 0;
        userStyles.set(user, (styleIndex + 1) % fancyStyles.length);

        // Get random design
        const designIndex = Math.floor(Math.random() * pingDesigns.length);
        
        // Send reaction
        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        
        await conn.sendMessage(from, {
            react: { text: reactionEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        // Apply fancy style to the ping text
        const pingText = `DARKZONE-MD SPEED: ${responseTime.toFixed(2)}ms`;
        const styledText = fancyStyles[styleIndex](pingText);

        // Create final message with design
        const finalMessage = pingDesigns[designIndex](styledText);

        await conn.sendMessage(from, {
            text: finalMessage,
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

// Traditional ping2 command remains as backup
cmd({
    pattern: "ping2",
    desc: "Check bot's response time (traditional method).",
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
        await conn.sendMessage(from, { 
            text: `*🔥 DARKZONE-MD SPEED : ${ping}ms*\n📢 Join our channel: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J` 
        }, { quoted: message })
    } catch (e) {
        console.log(e)
        reply(`${e}`)
    }
});
