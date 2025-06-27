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
    desc: "Show all bot commands with interactive buttons",
    category: "menu",
    react: "📜",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `╭━━〔 🚀 *${config.BOT_NAME}* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 👑 Owner : *${config.OWNER_NAME}*
┃◈┃• ⚙️ Prefix : *[${config.PREFIX}]*
┃◈┃• 🌐 Platform : *Heroku*
┃◈┃• 📦 Version : *4.0.0*
┃◈┃• ⏱️ Runtime : *${runtime(process.uptime())}*
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*🎯 Choose a category from the buttons below:*
*📱 Click any button to explore commands!*`;

        // Create list message with interactive buttons
        const sections = [{
            title: "📥 DOWNLOAD MENU",
            rows: [
                {id: 'download_menu', title: '📥 Download Commands', description: 'Facebook, TikTok, Instagram, YouTube etc.'},
                {id: 'media_menu', title: '🎵 Media Commands', description: 'Audio, Video, Music downloads'}
            ]
        },
        {
            title: "👥 GROUP MANAGEMENT",
            rows: [
                {id: 'group_menu', title: '👥 Group Commands', description: 'Add, Remove, Promote, Demote etc.'},
                {id: 'admin_menu', title: '👮 Admin Commands', description: 'Kick, Mute, Lock group etc.'}
            ]
        },
        {
            title: "🎉 FUN & ENTERTAINMENT",
            rows: [
                {id: 'fun_menu', title: '🎉 Fun Commands', description: 'Games, Jokes, Reactions etc.'},
                {id: 'reactions_menu', title: '🎭 Reaction Commands', description: 'Hug, Kiss, Pat, Slap etc.'},
                {id: 'anime_menu', title: '🎎 Anime Commands', description: 'Anime pics, Waifu, Neko etc.'}
            ]
        },
        {
            title: "🤖 AI & TOOLS",
            rows: [
                {id: 'ai_menu', title: '🤖 AI Commands', description: 'ChatGPT, Bing, BlackBox AI etc.'},
                {id: 'convert_menu', title: '🔄 Convert Tools', description: 'Sticker, Base64, URL tools etc.'},
                {id: 'logo_menu', title: '🎨 Logo Maker', description: 'Create amazing logos'}
            ]
        },
        {
            title: "⚙️ OTHER MENUS",
            rows: [
                {id: 'owner_menu', title: '👑 Owner Menu', description: 'Bot owner commands'},
                {id: 'main_menu', title: '⚡ Main Menu', description: 'Basic bot commands'},
                {id: 'other_menu', title: 'ℹ️ Other Menu', description: 'Utility commands'},
                {id: 'show_all', title: '📋 Show All Commands', description: 'Display complete command list'}
            ]
        }];

        const listMessage = {
            text: dec,
            footer: `${config.DESCRIPTION}\n\n_Select a category to explore commands_`,
            title: `🤖 ${config.BOT_NAME} Menu`,
            buttonText: "🔥 EXPLORE MENU",
            sections: sections
        };

        await conn.sendMessage(from, listMessage, { quoted: mek });

        // Send audio file if exists
        try {
            const audioPath = path.join(__dirname, '../assets/menu.m4a');
            if (fs.existsSync(audioPath)) {
                await conn.sendMessage(from, {
                    audio: fs.readFileSync(audioPath),
                    mimetype: 'audio/mp4',
                    ptt: true,
                }, { quoted: mek });
            }
        } catch (audioError) {
            console.log('Audio file not found:', audioError.message);
        }
        
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Handle Download Menu
cmd({
    pattern: "download_menu",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let downloadMenu = `╭━━〔 📥 *DOWNLOAD MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🟦 ${config.PREFIX}facebook <url>
┃◈┃• 📁 ${config.PREFIX}mediafire <url>
┃◈┃• 🎵 ${config.PREFIX}tiktok <url>
┃◈┃• 🐦 ${config.PREFIX}twitter <url>
┃◈┃• 📷 ${config.PREFIX}insta <url>
┃◈┃• 📦 ${config.PREFIX}apk <name>
┃◈┃• 🖼️ ${config.PREFIX}img <query>
┃◈┃• ▶️ ${config.PREFIX}tt2 <url>
┃◈┃• 📌 ${config.PREFIX}pins <url>
┃◈┃• 🔄 ${config.PREFIX}apk2 <name>
┃◈┃• 🔵 ${config.PREFIX}fb2 <url>
┃◈┃• 📍 ${config.PREFIX}pinterest <query>
┃◈┃• 🎶 ${config.PREFIX}spotify <url>
┃◈┃• 🎧 ${config.PREFIX}play <song name>
┃◈┃• 🎧 ${config.PREFIX}play2 <song name>
┃◈┃• 🔉 ${config.PREFIX}audio <url>
┃◈┃• 🎬 ${config.PREFIX}video <url>
┃◈┃• 📹 ${config.PREFIX}video2 <url>
┃◈┃• 🎵 ${config.PREFIX}ytmp3 <url>
┃◈┃• 📹 ${config.PREFIX}ytmp4 <url>
┃◈┃• 🎶 ${config.PREFIX}song <name>
┃◈┃• 🎬 ${config.PREFIX}darama <name>
┃◈┃• ☁️ ${config.PREFIX}gdrive <url>
┃◈┃• 🌐 ${config.PREFIX}ssweb <url>
┃◈┃• 🎵 ${config.PREFIX}tiks <url>
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*💡 Tip: Replace <url> with actual link and <query> with search term*`;

        await conn.sendMessage(from, { text: downloadMenu }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Handle Media Menu
cmd({
    pattern: "media_menu",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let mediaMenu = `╭━━〔 🎵 *MEDIA MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🎧 ${config.PREFIX}play <song name>
┃◈┃• 🎧 ${config.PREFIX}play2 <song name>
┃◈┃• 🎵 ${config.PREFIX}ytmp3 <youtube url>
┃◈┃• 📹 ${config.PREFIX}ytmp4 <youtube url>
┃◈┃• 🎶 ${config.PREFIX}song <song name>
┃◈┃• 🎶 ${config.PREFIX}spotify <spotify url>
┃◈┃• 🔉 ${config.PREFIX}audio <video url>
┃◈┃• 🎬 ${config.PREFIX}video <url>
┃◈┃• 📹 ${config.PREFIX}video2 <url>
┃◈┃• 🎵 ${config.PREFIX}tomp3 <reply to video>
┃◈┃• 🎬 ${config.PREFIX}darama <drama name>
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*🎵 Download and convert media files easily!*`;

        await conn.sendMessage(from, { text: mediaMenu }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Handle Group Menu
cmd({
    pattern: "group_menu",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let groupMenu = `╭━━〔 👥 *GROUP MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🔗 ${config.PREFIX}grouplink
┃◈┃• ➕ ${config.PREFIX}add <number>
┃◈┃• ➖ ${config.PREFIX}remove <@user>
┃◈┃• 👢 ${config.PREFIX}kick <@user>
┃◈┃• ⬆️ ${config.PREFIX}promote <@user>
┃◈┃• ⬇️ ${config.PREFIX}demote <@user>
┃◈┃• 🚮 ${config.PREFIX}dismiss <@user>
┃◈┃• 🔄 ${config.PREFIX}revoke
┃◈┃• 👋 ${config.PREFIX}setgoodbye <text>
┃◈┃• 🎉 ${config.PREFIX}setwelcome <text>
┃◈┃• 🗑️ ${config.PREFIX}delete <reply>
┃◈┃• 🖼️ ${config.PREFIX}getpic
┃◈┃• ℹ️ ${config.PREFIX}ginfo
┃◈┃• ⏳ ${config.PREFIX}disappear on/off/7d/24h
┃◈┃• 📝 ${config.PREFIX}allreq
┃◈┃• ✏️ ${config.PREFIX}updategname <name>
┃◈┃• 📝 ${config.PREFIX}updategdesc <desc>
┃◈┃• 📩 ${config.PREFIX}joinrequests
┃◈┃• 📨 ${config.PREFIX}senddm <@user> <msg>
┃◈┃• 📩 ${config.PREFIX}invite <number>
┃◈┃• #️⃣ ${config.PREFIX}tag <text>
┃◈┃• 🏷️ ${config.PREFIX}hidetag <text>
┃◈┃• @️⃣ ${config.PREFIX}tagall <text>
┃◈┃• 👔 ${config.PREFIX}tagadmins <text>
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*📋 Manage your group like a pro!*`;

        await conn.sendMessage(from, { text: groupMenu }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Handle Admin Menu
cmd({
    pattern: "admin_menu",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let adminMenu = `╭━━〔 👮 *ADMIN MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🚪 ${config.PREFIX}kickall
┃◈┃• 🚷 ${config.PREFIX}kickall2
┃◈┃• 🚫 ${config.PREFIX}kickall3
┃◈┃• 🏃 ${config.PREFIX}nikal <@user>
┃◈┃• 🔇 ${config.PREFIX}mute <@user>
┃◈┃• 🔊 ${config.PREFIX}unmute <@user>
┃◈┃• 🔒 ${config.PREFIX}lockgc
┃◈┃• 🔓 ${config.PREFIX}unlockgc
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*⚠️ Admin only commands for group management*`;

        await conn.sendMessage(from, { text: adminMenu }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Handle Fun Menu
cmd({
    pattern: "fun_menu",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let funMenu = `╭━━〔 🎉 *FUN MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🤪 ${config.PREFIX}shapar
┃◈┃• ⭐ ${config.PREFIX}rate <@user>
┃◈┃• 🤬 ${config.PREFIX}insult <@user>
┃◈┃• 💻 ${config.PREFIX}hack <@user>
┃◈┃• 💘 ${config.PREFIX}ship <@user1> <@user2>
┃◈┃• 🎭 ${config.PREFIX}character
┃◈┃• 💌 ${config.PREFIX}pickup
┃◈┃• 😆 ${config.PREFIX}joke
┃◈┃• ❤️ ${config.PREFIX}hrt
┃◈┃• 😊 ${config.PREFIX}hpy
┃◈┃• 😔 ${config.PREFIX}syd
┃◈┃• 😠 ${config.PREFIX}anger
┃◈┃• 😳 ${config.PREFIX}shy
┃◈┃• 💋 ${config.PREFIX}kiss
┃◈┃• 🧐 ${config.PREFIX}mon
┃◈┃• 😕 ${config.PREFIX}cunfuzed
┃◈┃• ✋ ${config.PREFIX}hand
┃◈┃• 🤲 ${config.PREFIX}hold
┃◈┃• 🤗 ${config.PREFIX}hug
┃◈┃• 🎵 ${config.PREFIX}hifi
┃◈┃• 👉 ${config.PREFIX}poke <@user>
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*😄 Have fun with these entertaining commands!*`;

        await conn.sendMessage(from, { text: funMenu }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Handle Reactions Menu
cmd({
    pattern: "reactions_menu",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let reactionsMenu = `╭━━〔 🎭 *REACTIONS MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 👊 ${config.PREFIX}bully <@user>
┃◈┃• 🤗 ${config.PREFIX}cuddle <@user>
┃◈┃• 😢 ${config.PREFIX}cry <@user>
┃◈┃• 🤗 ${config.PREFIX}hug <@user>
┃◈┃• 🐺 ${config.PREFIX}awoo <@user>
┃◈┃• 💋 ${config.PREFIX}kiss <@user>
┃◈┃• 👅 ${config.PREFIX}lick <@user>
┃◈┃• 🖐️ ${config.PREFIX}pat <@user>
┃◈┃• 😏 ${config.PREFIX}smug <@user>
┃◈┃• 🔨 ${config.PREFIX}bonk <@user>
┃◈┃• 🚀 ${config.PREFIX}yeet <@user>
┃◈┃• 😊 ${config.PREFIX}blush <@user>
┃◈┃• 😄 ${config.PREFIX}smile <@user>
┃◈┃• 👋 ${config.PREFIX}wave <@user>
┃◈┃• ✋ ${config.PREFIX}highfive <@user>
┃◈┃• 🤝 ${config.PREFIX}handhold <@user>
┃◈┃• 🍜 ${config.PREFIX}nom <@user>
┃◈┃• 🦷 ${config.PREFIX}bite <@user>
┃◈┃• 🤗 ${config.PREFIX}glomp <@user>
┃◈┃• 👋 ${config.PREFIX}slap <@user>
┃◈┃• 💀 ${config.PREFIX}kill <@user>
┃◈┃• 😊 ${config.PREFIX}happy <@user>
┃◈┃• 😉 ${config.PREFIX}wink <@user>
┃◈┃• 👉 ${config.PREFIX}poke <@user>
┃◈┃• 💃 ${config.PREFIX}dance <@user>
┃◈┃• 😬 ${config.PREFIX}cringe <@user>
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*🎭 Express yourself with animated reactions!*
*💡 Tag someone to use these reactions*`;

        await conn.sendMessage(from, { text: reactionsMenu }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Handle AI Menu
cmd({
    pattern: "ai_menu",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let aiMenu = `╭━━〔 🤖 *AI MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🧠 ${config.PREFIX}ai <question>
┃◈┃• 🤖 ${config.PREFIX}gpt <question>
┃◈┃• 🤖 ${config.PREFIX}gpt2 <question>
┃◈┃• 🤖 ${config.PREFIX}gpt3 <question>
┃◈┃• 🤖 ${config.PREFIX}gptmini <question>
┃◈┃• 🧠 ${config.PREFIX}gpt4 <question>
┃◈┃• 🔵 ${config.PREFIX}meta <question>
┃◈┃• 📦 ${config.PREFIX}blackbox <code>
┃◈┃• 🌈 ${config.PREFIX}luma <prompt>
┃◈┃• 🎧 ${config.PREFIX}dj <text>
┃◈┃• 👑 ${config.PREFIX}khan <question>
┃◈┃• 🤵 ${config.PREFIX}jawad <question>
┃◈┃• 🔍 ${config.PREFIX}bing <question>
┃◈┃• 🎨 ${config.PREFIX}imagine <prompt>
┃◈┃• 🖼️ ${config.PREFIX}imagine2 <prompt>
┃◈┃• 🤖 ${config.PREFIX}copilot <question>
┃◈┃• ❓ ${config.PREFIX}ask <question>
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*🧠 Powered by advanced AI technology!*
*💡 Ask anything and get intelligent responses*`;

        await conn.sendMessage(from, { text: aiMenu }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Handle Convert Menu
cmd({
    pattern: "convert_menu",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let convertMenu = `╭━━〔 🔄 *CONVERT MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🏷️ ${config.PREFIX}sticker <reply to img/vid>
┃◈┃• 🏷️ ${config.PREFIX}sticker2 <reply to img>
┃◈┃• 😀 ${config.PREFIX}emojimix <emoji1> <emoji2>
┃◈┃• ✨ ${config.PREFIX}fancy <text>
┃◈┃• 🖼️ ${config.PREFIX}take <new> <author>
┃◈┃• 🎵 ${config.PREFIX}tomp3 <reply to video>
┃◈┃• 🗣️ ${config.PREFIX}tts <text>
┃◈┃• 🌐 ${config.PREFIX}trt <text>
┃◈┃• 🔢 ${config.PREFIX}base64 <text>
┃◈┃• 🔠 ${config.PREFIX}unbase64 <code>
┃◈┃• 010 ${config.PREFIX}binary <text>
┃◈┃• 🔤 ${config.PREFIX}dbinary <binary>
┃◈┃• 🔗 ${config.PREFIX}tinyurl <url>
┃◈┃• 🌐 ${config.PREFIX}urldecode <encoded>
┃◈┃• 🌐 ${config.PREFIX}urlencode <text>
┃◈┃• 🌐 ${config.PREFIX}url <link>
┃◈┃• 🔁 ${config.PREFIX}repeat <text>
┃◈┃• 📖 ${config.PREFIX}readmore <text>
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*🔄 Convert and transform your content!*`;

        await conn.sendMessage(from, { text: convertMenu }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Handle Logo Menu
cmd({
    pattern: "logo_menu",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let logoMenu = `╭━━〔 🎨 *LOGO MAKER* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 💡 ${config.PREFIX}neonlight <text>
┃◈┃• 🎀 ${config.PREFIX}blackpink <text>
┃◈┃• 🐉 ${config.PREFIX}dragonball <text>
┃◈┃• 🎭 ${config.PREFIX}3dcomic <text>
┃◈┃• 🇺🇸 ${config.PREFIX}america <text>
┃◈┃• 🍥 ${config.PREFIX}naruto <text>
┃◈┃• 😢 ${config.PREFIX}sadgirl <text>
┃◈┃• ☁️ ${config.PREFIX}clouds <text>
┃◈┃• 🚀 ${config.PREFIX}futuristic <text>
┃◈┃• 📜 ${config.PREFIX}3dpaper <text>
┃◈┃• ✏️ ${config.PREFIX}eraser <text>
┃◈┃• 🌇 ${config.PREFIX}sunset <text>
┃◈┃• 🍃 ${config.PREFIX}leaf <text>
┃◈┃• 🌌 ${config.PREFIX}galaxy <text>
┃◈┃• 💀 ${config.PREFIX}sans <text>
┃◈┃• 💥 ${config.PREFIX}boom <text>
┃◈┃• 💻 ${config.PREFIX}hacker <text>
┃◈┃• 😈 ${config.PREFIX}devilwings <text>
┃◈┃• 🇳🇬 ${config.PREFIX}nigeria <text>
┃◈┃• 💡 ${config.PREFIX}bulb <text>
┃◈┃• 👼 ${config.PREFIX}angelwings <text>
┃◈┃• ♈ ${config.PREFIX}zodiac <text>
┃◈┃• 💎 ${config.PREFIX}luxury <text>
┃◈┃• 🎨 ${config.PREFIX}paint <text>
┃◈┃• ❄️ ${config.PREFIX}frozen <text>
┃◈┃• 🏰 ${config.PREFIX}castle <text>
┃◈┃• 🖋️ ${config.PREFIX}tatoo <text>
┃◈┃• 🔫 ${config.PREFIX}valorant <text>
┃◈┃• 🐻 ${config.PREFIX}bear <text>
┃◈┃• 🔠 ${config.PREFIX}typography <text>
┃◈┃• 🎂 ${config.PREFIX}birthday <text>
┃◈┃• 🎨 ${config.PREFIX}logo <text>
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*🎨 Create stunning logos with different styles!*`;

        await conn.sendMessage(from, { text: logoMenu }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});

