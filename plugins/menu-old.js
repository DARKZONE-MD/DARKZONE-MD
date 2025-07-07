const config = require('../config');
const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const os = require("os");
const path = require('path');
const axios = require('axios');
const fs = require('fs');

cmd({
    pattern: "menu3",
    desc: "menu the bot",
    category: "menu3",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply }) => {
    try {
        const dec = `╭━━━〔 *${config.BOT_NAME} Main Menu* 〕━━━╮
┃ ✨ *Owner:* ${config.OWNER_NAME}
┃ ⚙️ *Mode:* ${config.MODE}
┃ 📡 *Platform:* Heroku
┃ 🧠 *Type:* NodeJs (Multi Device)
┃ ⌨️ *Prefix:* ${config.PREFIX}
┃ 🧾 *Version:* 3.0.0 Beta
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🧩 *Command Categories* 〕━━╮
┃ 📖 Quranmenu
┃ 🕋 Prayertime
┃ 🤖 Aimenu
┃ 🎭 Anmiemenu
┃ 😹 Reactions
┃ 🔁 Convertmenu
┃ 🎉 Funmenu
┃ ⬇️ Dlmenu
┃ ⚒️ Listcmd
┃ 🏠 Mainmenu
┃ 👥 Groupmenu
┃ 📜 Allmenu
┃ 👑 Ownermenu
┃ 🧩 Othermenu
┃ 🖌️ Logo
┃ 📦 Repo
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> ${config.DESCRIPTION}
`;

        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

        // Send local audio from assets/menu.m4a

const audioPath = path.join(__dirname, '../assets/menu.m4a');
await conn.sendMessage(from, {
    audio: fs.readFileSync(audioPath),
    mimetype: 'audio/mp4',
    ptt: true,
}, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e}`);
    }
});

cmd({
    pattern: "logo",
    alias: ["logomenu"],
    desc: "menu the bot",
    category: "menu",
    react: "🧃",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `‎‎╔══◇◆◇════════╗
‎ 『 🖼️ *𝗟𝗢𝗚𝗢 𝗟𝗜𝗦𝗧* 』
‎╚══◇◆◇════════╝
‎╭━[✨ *𝗟𝗢𝗚𝗢𝗢𝗦* ]━━━━━━╮
‎│ • *neonlight*
‎│ • *blackpink*
‎│ • *dragonball*
‎│ • *3dcomic*
‎│ • *america*
‎│ • *naruto*
‎│ • *sadgirl*
‎│ • *clouds*
‎│ • *futuristic*
‎│ • *3dpaper*
‎│ • *eraser*
‎│ • *sunset*
‎│ • *leaf*
‎│ • *galaxy*
‎│ • *sans*
‎│ • *boom*
‎│ • *hacker*
‎│ • *devilwings*
‎│ • *nigeria*
‎│ • *bulb*
‎│ • *angelwings*
‎│ • *zodiac*
‎│ • *luxury*
‎│ • *paint*
‎│ • *frozen*
‎│ • *castle*
‎│ • *tatoo*
‎│ • *valorant*
‎│ • *bear*
‎│ • *typography*
‎│ • *birthday*
‎╰━━━━━━━━━━━━━━╯`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: "𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟",
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

cmd({
    pattern: "reactions",
    desc: "Shows the reaction commands",
    category: "menu",
    react: "💫",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        let dec = `‎╔═══◇◆◇═══════╗
‎ 『 💢 *𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡𝗦 𝗠𝗘𝗡𝗨* 』
‎╚═══◇◆◇═══════╝
‎╭━[🎭 *𝗔𝗖𝗧𝗜𝗢𝗡𝗦* ]━━━━━━╮
‎│ • *bully* @tag
‎│ • *cuddle* @tag
‎│ • *cry* @tag
‎│ • *hug* @tag
‎│ • *awoo* @tag
‎│ • *kiss* @tag
‎│ • *lick* @tag
‎│ • *pat* @tag
‎│ • *smug* @tag
‎│ • *bonk* @tag
‎│ • *yeet* @tag
‎│ • *blush* @tag
‎│ • *smile* @tag
‎│ • *wave* @tag
‎│ • *highfive* @tag
‎│ • *handhold* @tag
‎│ • *nom* @tag
‎│ • *bite* @tag
‎│ • *glomp* @tag
‎│ • *slap* @tag
‎│ • *kill* @tag
‎│ • *happy* @tag
‎│ • *wink* @tag
‎│ • *poke* @tag
‎│ • *dance* @tag
‎│ • *cringe* @tag
‎╰━━━━━━━━━━━━━━╯
> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 144
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// dlmenu

cmd({
    pattern: "dlmenu",
    desc: "menu the bot",
    category: "menu",
    react: "⤵️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `‎‎╔════◇◆◇══════╗
‎ 『 📥 *𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗠𝗘𝗡𝗨* 』
‎╚════◇◆◇══════╝
‎╭━[⚡ *𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗦* ]━━━╮
‎│ • *facebook*
‎│ • *mediafire*
‎│ • *tiktok*
‎│ • *twitter*
‎│ • *Insta*
‎│ • *apk*
‎│ • *img*
‎│ • *tt2*
‎│ • *pins*
‎│ • *apk2*
‎│ • *fb2*
‎│ • *pinterest*
‎│ • *spotify*
‎│ • *play*
‎│ • *play2*
‎│ • *play3*
‎│ • *play4*
‎│ • *play5*
‎│ • *play6*
‎│ • *play7*
‎│ • *play8*
‎│ • *play9*
‎│ • *play10*
‎│ • *audio*
‎│ • *video*
‎│ • *video2*
‎│ • *video3*
‎│ • *video4*
‎│ • *video5*
‎│ • *video6*
‎│ • *video7*
‎│ • *video8*
‎│ • *video9*
‎│ • *video10*
‎│ • *ytmp3*
‎│ • *ytmp4*
‎│ • *song*
‎│ • *darama*
‎│ • *gdrive*
‎│ • *ssweb*
‎│ • *tiks*
‎╰━━━━━━━━━━━━━━╯
> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// group menu

cmd({
    pattern: "groupmenu",
    desc: "menu the bot",
    category: "menu",
    react: "⤵️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try
       {
        let dec = `‎‎╔════◇◆◇══════╗
‎『👥 *𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨* 』
‎╚════◇◆◇══════╝
‎╭━[🌡️ *𝗠𝗔𝗡𝗔𝗚𝗘𝗠𝗘𝗡𝗧* ]━━╮
‎│ • *grouplink*
‎│ • *kickall*
‎│ • *kickall2*
‎│ • *kickall3*
‎│ • *add* @user
‎│ • *remove* @user
‎│ • *kick* @user
‎│ • *setgoodbye*
‎│ • *setwelcome*
‎│ • *delete*
‎│ • *getpic*
‎│ • *ginfo*
‎│ • *disappear on*
‎│ • *disappear off*
‎│ • *disappear 7D,24H*
‎│ • *allreq*
‎│ • *updategname*
‎│ • *updategdesc*
‎│ • *joinrequests*
‎│ • *senddm*
‎│ • *nikal*
‎╰━━━━━━━━━━━━━━╯
‎╭─━⚡ *𝗔𝗗𝗠𝗜𝗡 𝗧𝗢𝗢𝗟𝗦* ─━╮
‎│ • *promote* @user
‎│ • *demote* @user
‎│ • *dismiss*
‎│ • *revoke*
‎│ • *mute* [time]
‎│ • *unmute*
‎│ • *lockgc*
‎│ • *unlockgc*
‎╰──────────────╯
‎╔══〔 🏷️ *𝗧𝗔𝗚𝗚𝗜𝗡𝗚* 〕══╗
‎│ • *tag* @user
‎│ • *hidetag* [msg]
‎│ • *tagall*
‎│ • *tagadmins*
‎│ • *invite*
‎╚══════════════╝
> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// fun menu

cmd({
    pattern: "funmenu",
    desc: "menu the bot",
    category: "menu",
    react: "😎",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {

        let dec = `╔════◇◆◇══════╗
‎ 『 😄 *𝗙𝗨𝗡 𝗠𝗘𝗡𝗨* 』
‎╚══════◇◆◇════╝
‎╭━[🎭 *𝗜𝗡𝗧𝗘𝗥𝗔𝗖𝗧𝗜𝗩𝗘* ]━━━╮
‎│ • *shapar*
‎│ • *rate* @user
‎│ • *insult* @user
‎│ • *hack* @user
‎│ • *ship* @user1 @user2
‎│ • *character*
‎│ • *pickup*
‎│ • *joke*
‎│ • *hrt*
‎│ • *hpy*
‎│ • *syd*
‎│ • *anger*
‎│ • *shy*
‎│ • *kiss*
‎│ • *mon*
‎│ • *cunfuzed*
‎│ • *setpp*
‎│ • *hand*
‎│ • *nikal*
‎│ • *hold*
‎│ • *hug*
‎│ • *hifi*
‎│ • *poke*
‎╰━━━━━━━━━━━━━━╯
> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// other menu

cmd({
    pattern: "othermenu",
    desc: "menu the bot",
    category: "menu",
    react: "🤖",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `‎╔════◇◆◇══════╗
‎『 *𝗢𝗧𝗛𝗘𝗥 𝗠𝗘𝗡𝗨* 』
‎╚════◇◆◇══════╝
‎╭━[🕒 *𝗧𝗜𝗠𝗘 & 𝗗𝗔𝗧𝗘* ]━━╮
‎│ • *timenow*
‎│ • *date*
‎╰━━━━━━━━━━━━━━╯
‎╭━[🧮 *𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗜𝗢𝗡𝗦* ]━╮
‎│ • *count* [num]
‎│ • *calculate* [expr]
‎│ • *countx*
‎╰━━━━━━━━━━━━━━╯
‎╭━[🎲 *𝗥𝗔𝗡𝗗𝗢𝗠 & 𝗙𝗨𝗡* ]━━╮
‎│ • *flip*
‎│ • *coinflip*
‎│ • *rcolor*
‎│ • *roll*
‎│ • *fact*
‎│ • *rw*
‎│ • *pair* @user
‎│ • *pair2* @user
‎│ • *pair3* @user
‎╰━━━━━━━━━━━━━━╯
‎╭━[✨ *𝗧𝗘𝗫𝗧 & 𝗧𝗢𝗢𝗟𝗦* ]━━╮
‎│ • *fancy* [text]
‎│ • *logo* [text]
‎│ • *cpp* [code]
‎│ • *save* [content]
‎╰━━━━━━━━━━━━━━╯
‎╭━[🔍 *𝗦𝗘𝗔𝗥𝗖𝗛 & 𝗜𝗡𝗙𝗢* ]━━╮
‎│ • *define* [word]
‎│ • *news* [query]
‎│ • *movie* [name]
‎│ • *weather* [location]
‎│ • *wikipedia* [term]
‎│ • *yts* [query]
‎│ • *ytv* [query]
‎│ • *githubstalk* [user]
‎╰━━━━━━━━━━━━━━╯
‎╭━[⚙️ *𝗦𝗬𝗦𝗧𝗘𝗠 𝗧𝗢𝗢𝗟𝗦* ]━━╮
‎│ • *srepo*
‎│ • *gpass*
‎│ • *insult* @user
‎╰━━━━━━━━━━━━━━╯
> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// main menu

cmd({
    pattern: "mainmenu",
    desc: "menu the bot",
    category: "menu",
    react: "🗿",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `╔════◇◆◇══════╗
‎ 『 🏠 *𝗠𝗔𝗜𝗡 𝗠𝗘𝗡𝗨* 』
╚════◇◆◇══════╝
╭━[⚡ *𝗕𝗢𝗧 𝗖𝗢𝗡𝗧𝗥𝗢𝗟𝗦* ]━━╮
│ • *ping*
│ • *live*
│ • *alive*
│ • *runtime*
│ • *uptime*
│ • *repo*
│ • *owner*
│ • *menu*
│ • *menu2*
│ • *restart*
╰━━━━━━━━━━━━━━╯
> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// owner menu

cmd({
    pattern: "ownermenu",
    desc: "menu the bot",
    category: "menu",
    react: "🔰",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `‎╔════◇◆◇══════╗
‎『👑 *𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨* 』
‎╚════◇◆◇══════╝
‎╭━[⚡ *𝗢𝗪𝗡𝗘𝗥 𝗖𝗢𝗡𝗧𝗥𝗢𝗟𝗦* ]━━╮
‎│ • *owner*
‎│ • *menu*
‎│ • *menu2*
‎│ • *listcmd*
‎│ • *allmenu*
‎│ • *repo*
‎│ • *block* @user
‎│ • *unblock* @user
‎│ • *fullpp*
‎│ • *setpp*
‎╰━━━━━━━━━━━━━━╯
‎╭─━🔧 *𝗦𝗬𝗦𝗧𝗘𝗠 𝗧𝗢𝗢𝗟𝗦* ─━╮
‎│ • *restart*
‎│ • *shutdown*
‎│ • *updatecmd*
‎│ • *alive*
‎│ • *ping*
‎│ • *gjid*
‎│ • *jid*
‎╰──────────────╯
> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// convert menu

cmd({
    pattern: "convertmenu",
    desc: "menu the bot",
    category: "menu",
    react: "🥀",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `╭━━〔 *Convert Menu* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• sticker
┃◈┃• sticker2
┃◈┃• emojimix
┃◈┃• fancy
┃◈┃• take
┃◈┃• tomp3
┃◈┃• tts
┃◈┃• trt
┃◈┃• base64
┃◈┃• unbase64
┃◈┃• binary
┃◈┃• dbinary
┃◈┃• tinyurl
┃◈┃• urldecode
┃◈┃• urlencode
┃◈┃• url
┃◈┃• repeat 
┃◈┃• ask
┃◈┃• readmore
┃◈└───────────┈⊷
╰──────────────┈⊷
> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});


// anmie menu 

cmd({
    pattern: "animemenu",
    desc: "menu the bot",
    category: "menu",
    react: "🧚",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
          let dec = `╭━━〔 *Anime Menu* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• fack
┃◈┃• dog
┃◈┃• awoo
┃◈┃• garl
┃◈┃• waifu
┃◈┃• neko
┃◈┃• megnumin
┃◈┃• neko
┃◈┃• maid
┃◈┃• loli
┃◈┃• animegirl
┃◈┃• animegirl
┃◈┃• animegirl1
┃◈┃• animegirl2
┃◈┃• animegirl3
┃◈┃• animegirl4
┃◈┃• animegirl5
┃◈┃• anime1
┃◈┃• anime1
┃◈┃• anime2
┃◈┃• anime3
┃◈┃• anime4
┃◈┃• anime5
┃◈┃• animenews
┃◈┃• foxgirl
┃◈┃• naruto
┃◈└───────────┈⊷
╰──────────────┈⊷
> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});


// ai menu 

cmd({
    pattern: "aimenu",
    desc: "menu the bot",
    category: "menu",
    react: "🤖",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `╭━━〔 *Ai Menu* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• ai
┃◈┃• gpt3
┃◈┃• gpt2
┃◈┃• gptmini
┃◈┃• gpt
┃◈┃• meta
┃◈┃• blackbox
┃◈┃• luma
┃◈┃• dj 
┃◈┃• khan
┃◈┃• jawad
┃◈┃• gpt4
┃◈┃• bing
┃◈┃• imagine 
┃◈┃• imagine2
┃◈┃• copilot
┃◈└───────────┈⊷
╰──────────────┈⊷
> ${config.DESCRIPTION}`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/8cb9h0.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
