const config = require('../config')
const { cmd, commands } = require('../command');
const path = require('path'); 
const os = require("os")
const fs = require('fs');
const {runtime} = require('../lib/functions')
const axios = require('axios')

// Main menu command with buttons
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
        // Main menu with buttons
        const mainMenuButtons = {
            text: `╭━━〔 🚀 *${config.BOT_NAME}* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 👑 Owner : *${config.OWNER_NAME}*
┃◈┃• ⚙️ Prefix : *[${config.PREFIX}]*
┃◈┃• 🌐 Platform : *Heroku*
┃◈┃• 📦 Version : *4.0.0*
┃◈┃• ⏱️ Runtime : *${runtime(process.uptime())}*
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

🎯 *SELECT A CATEGORY*
Choose from the options below:`,
            footer: config.DESCRIPTION,
            buttons: [
                {
                    buttonId: 'btn_download',
                    buttonText: {displayText: '📥 DOWNLOAD MENU'},
                    type: 1
                },
                {
                    buttonId: 'btn_group',
                    buttonText: {displayText: '👥 GROUP MENU'},
                    type: 1
                },
                {
                    buttonId: 'btn_reactions',
                    buttonText: {displayText: '🎭 REACTIONS MENU'},
                    type: 1
                }
            ],
            headerType: 4,
            imageMessage: config.MENU_IMAGE_URL || 'https://files.catbox.moe/r2ncqh'
        };

        // Send main menu with buttons
        await conn.sendMessage(from, mainMenuButtons, { quoted: mek });

        // Send menu audio
        const audioPath = path.join(__dirname, '../assets/menu.m4a');
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(from, {
                audio: fs.readFileSync(audioPath),
                mimetype: 'audio/mp4',
                ptt: true,
            }, { quoted: mek });
        }
        
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e}`);
    }
});

// Menu navigation command
cmd({
    pattern: "menu_nav",
    desc: "Handle menu navigation",
    category: "menu",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const menuType = args[0];
        
        switch(menuType) {
            case 'more_categories':
                await sendMoreCategoriesMenu(conn, from, mek);
                break;
            case 'download_sub':
                await sendDownloadSubMenu(conn, from, mek);
                break;
            case 'group_sub':
                await sendGroupSubMenu(conn, from, mek);
                break;
            default:
                reply('❌ Invalid menu navigation');
        }
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e}`);
    }
});

// Handle button responses
conn.ev.on('messages.upsert', async (chatUpdate) => {
    try {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        
        const messageType = Object.keys(mek.message)[0];
        if (messageType === 'buttonsResponseMessage') {
            const buttonId = mek.message.buttonsResponseMessage.selectedButtonId;
            const from = mek.key.remoteJid;
            
            switch(buttonId) {
                case 'btn_download':
                    await sendDownloadMenu(conn, from, mek);
                    break;
                case 'btn_group':
                    await sendGroupMenu(conn, from, mek);
                    break;
                case 'btn_reactions':
                    await sendReactionsMenu(conn, from, mek);
                    break;
                case 'btn_more_menus':
                    await sendMoreMenus(conn, from, mek);
                    break;
                case 'btn_logo':
                    await sendLogoMenu(conn, from, mek);
                    break;
                case 'btn_owner':
                    await sendOwnerMenu(conn, from, mek);
                    break;
                case 'btn_fun':
                    await sendFunMenu(conn, from, mek);
                    break;
                case 'btn_convert':
                    await sendConvertMenu(conn, from, mek);
                    break;
                case 'btn_ai':
                    await sendAIMenu(conn, from, mek);
                    break;
                case 'btn_main':
                    await sendMainMenu(conn, from, mek);
                    break;
                case 'btn_anime':
                    await sendAnimeMenu(conn, from, mek);
                    break;
                case 'btn_other':
                    await sendOtherMenu(conn, from, mek);
                    break;
                case 'btn_back_main':
                    // Trigger main menu again
                    await conn.sendMessage(from, {text: '.menu2'}, {quoted: mek});
                    break;
            }
        }
        
        // Handle list responses
        if (messageType === 'listResponseMessage') {
            const listId = mek.message.listResponseMessage.singleSelectReply.selectedRowId;
            const from = mek.key.remoteJid;
            
            switch(listId) {
                case 'list_download_basic':
                    await sendDownloadBasicCommands(conn, from, mek);
                    break;
                case 'list_download_media':
                    await sendDownloadMediaCommands(conn, from, mek);
                    break;
                case 'list_download_social':
                    await sendDownloadSocialCommands(conn, from, mek);
                    break;
                case 'list_group_admin':
                    await sendGroupAdminCommands(conn, from, mek);
                    break;
                case 'list_group_manage':
                    await sendGroupManageCommands(conn, from, mek);
                    break;
                case 'list_group_settings':
                    await sendGroupSettingsCommands(conn, from, mek);
                    break;
                // Add more list handlers as needed
            }
        }
        
    } catch (e) {
        console.log('Button handler error:', e);
    }
});

// Download Menu Function
async function sendDownloadMenu(conn, from, mek) {
    const downloadList = {
        text: `╭━━〔 📥 *DOWNLOAD MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃ Choose your download category:
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷`,
        footer: 'Select a download category',
        title: '📥 DOWNLOAD CATEGORIES',
        buttonText: 'Choose Category',
        sections: [
            {
                title: '🎵 Media Downloads',
                rows: [
                    {id: 'list_download_basic', title: '🎧 Audio & Music', description: 'play, play2, audio, song, ytmp3, spotify'},
                    {id: 'list_download_media', title: '📹 Video Downloads', description: 'video, video2, ytmp4, tiktok, tt2'},
                    {id: 'list_download_social', title: '📱 Social Media', description: 'facebook, insta, twitter, pinterest'}
                ]
            },
            {
                title: '📦 File Downloads',
                rows: [
                    {id: 'list_download_files', title: '📁 Files & Apps', description: 'mediafire, apk, apk2, gdrive'},
                    {id: 'list_download_other', title: '🌐 Other Downloads', description: 'img, ssweb, darama, tiks'}
                ]
            }
        ]
    };
    
    await conn.sendMessage(from, downloadList, { quoted: mek });
}

// Group Menu Function
async function sendGroupMenu(conn, from, mek) {
    const groupList = {
        text: `╭━━〔 👥 *GROUP MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃ Manage your group effectively:
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷`,
        footer: 'Select group management category',
        title: '👥 GROUP MANAGEMENT',
        buttonText: 'Choose Category',
        sections: [
            {
                title: '👑 Admin Controls',
                rows: [
                    {id: 'list_group_admin', title: '⚡ Admin Commands', description: 'add, remove, kick, promote, demote'},
                    {id: 'list_group_manage', title: '🔧 Group Management', description: 'kickall, dismiss, revoke, mute, unmute'},
                    {id: 'list_group_settings', title: '⚙️ Group Settings', description: 'lockgc, unlockgc, disappear, updategname'}
                ]
            },
            {
                title: '📨 Communication',
                rows: [
                    {id: 'list_group_comm', title: '💬 Messages & Tags', description: 'tag, hidetag, tagall, tagadmins, senddm'},
                    {id: 'list_group_info', title: 'ℹ️ Group Info', description: 'ginfo, getpic, grouplink, joinrequests'}
                ]
            }
        ]
    };
    
    await conn.sendMessage(from, groupList, { quoted: mek });
}

// Reactions Menu Function
async function sendReactionsMenu(conn, from, mek) {
    const reactionsButtons = {
        text: `╭━━〔 🎭 *REACTIONS MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 👊 bully @tag    • 🤗 cuddle @tag
┃◈┃• 😢 cry @tag      • 🤗 hug @tag  
┃◈┃• 🐺 awoo @tag     • 💋 kiss @tag
┃◈┃• 👅 lick @tag     • 🖐️ pat @tag
┃◈┃• 😏 smug @tag     • 🔨 bonk @tag
┃◈┃• 🚀 yeet @tag     • 😊 blush @tag
┃◈┃• 😄 smile @tag    • 👋 wave @tag
┃◈┃• ✋ highfive @tag • 🤝 handhold @tag
┃◈┃• 🍜 nom @tag      • 🦷 bite @tag
┃◈┃• 🤗 glomp @tag    • 👋 slap @tag
┃◈┃• 💀 kill @tag     • 😊 happy @tag
┃◈┃• 😉 wink @tag     • 👉 poke @tag
┃◈┃• 💃 dance @tag    • 😬 cringe @tag
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*Usage:* Type command followed by @username
*Example:* .hug @user`,
        footer: 'React with friends using these commands!',
        buttons: [
            {
                buttonId: 'btn_more_menus',
                buttonText: {displayText: '📚 MORE MENUS'},
                type: 1
            },
            {
                buttonId: 'btn_back_main',
                buttonText: {displayText: '🔙 BACK TO MAIN'},
                type: 1
            }
        ],
        headerType: 1
    };
    
    await conn.sendMessage(from, reactionsButtons, { quoted: mek });
}

// More Menus Function
async function sendMoreMenus(conn, from, mek) {
    const moreMenus = {
        text: `╭━━〔 📚 *MORE CATEGORIES* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃ Explore additional features:
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷`,
        footer: 'Choose from more categories',
        buttons: [
            {
                buttonId: 'btn_logo',
                buttonText: {displayText: '🎨 LOGO MAKER'},
                type: 1
            },
            {
                buttonId: 'btn_owner',
                buttonText: {displayText: '👑 OWNER MENU'},
                type: 1
            },
            {
                buttonId: 'btn_fun',
                buttonText: {displayText: '🎉 FUN MENU'},
                type: 1
            }
        ],
        headerType: 1
    };
    
    await conn.sendMessage(from, moreMenus, { quoted: mek });
}

// Additional menu functions
async function sendLogoMenu(conn, from, mek) {
    const logoMenu = {
        text: `╭━━〔 🎨 *LOGO MAKER* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 💡 neonlight    • 🎀 blackpink
┃◈┃• 🐉 dragonball   • 🎭 3dcomic
┃◈┃• 🇺🇸 america      • 🍥 naruto
┃◈┃• 😢 sadgirl      • ☁️ clouds
┃◈┃• 🚀 futuristic   • 📜 3dpaper
┃◈┃• ✏️ eraser       • 🌇 sunset
┃◈┃• 🍃 leaf         • 🌌 galaxy
┃◈┃• 💀 sans         • 💥 boom
┃◈┃• 💻 hacker       • 😈 devilwings
┃◈┃• 🇳🇬 nigeria      • 💡 bulb
┃◈┃• 👼 angelwings   • ♈ zodiac
┃◈┃• 💎 luxury       • 🎨 paint
┃◈┃• ❄️ frozen       • 🏰 castle
┃◈┃• 🖋️ tatoo        • 🔫 valorant
┃◈┃• 🐻 bear         • 🔠 typography
┃◈┃• 🎂 birthday
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

*Usage:* .commandname <your text>
*Example:* .neonlight Hello World`,
        footer: 'Create amazing logos with text!',
        buttons: [
            {
                buttonId: 'btn_convert',
                buttonText: {displayText: '🔄 CONVERT MENU'},
                type: 1
            },
            {
                buttonId: 'btn_back_main',
                buttonText: {displayText: '🔙 BACK TO MAIN'},
                type: 1
            }
        ],
        headerType: 1
    };
    
    await conn.sendMessage(from, logoMenu, { quoted: mek });
}

async function sendOwnerMenu(conn, from, mek) {
    const ownerMenu = {
        text: `╭━━〔 👑 *OWNER MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 👑 owner        • 📜 menu
┃◈┃• 📜 menu2        • 📊 vv
┃◈┃• 📋 listcmd      • 📚 allmenu
┃◈┃• 📦 repo         • 🚫 block
┃◈┃• ✅ unblock      • 🖼️ fullpp
┃◈┃• 🖼️ setpp        • 🔄 restart
┃◈┃• ⏹️ shutdown     • 🔄 updatecmd
┃◈┃• 💚 alive        • 🏓 ping
┃◈┃• 🆔 gjid         • 🆔 jid
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

⚠️ *Owner Only Commands*`,
        footer: 'These commands are restricted to bot owner',
        buttons: [
            {
                buttonId: 'btn_ai',
                buttonText: {displayText: '🤖 AI MENU'},
                type: 1
            },
            {
                buttonId: 'btn_back_main',
                buttonText: {displayText: '🔙 BACK TO MAIN'},
                type: 1
            }
        ],
        headerType: 1
    };
    
    await conn.sendMessage(from, ownerMenu, { quoted: mek });
}

async function sendFunMenu(conn, from, mek) {
    const funMenu = {
        text: `╭━━〔 🎉 *FUN MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🤪 shapar       • ⭐ rate
┃◈┃• 🤬 insult       • 💻 hack
┃◈┃• 💘 ship         • 🎭 character
┃◈┃• 💌 pickup       • 😆 joke
┃◈┃• ❤️ hrt          • 😊 hpy
┃◈┃• 😔 syd          • 😠 anger
┃◈┃• 😳 shy          • 💋 kiss
┃◈┃• 🧐 mon          • 😕 cunfuzed
┃◈┃• 🖼️ setpp        • ✋ hand
┃◈┃• 🏃 nikal        • 🤲 hold
┃◈┃• 🤗 hug          • 🎵 hifi
┃◈┃• 👉 poke
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

Have fun with these entertaining commands!`,
        footer: 'Entertainment and fun commands',
        buttons: [
            {
                buttonId: 'btn_anime',
                buttonText: {displayText: '🎎 ANIME MENU'},
                type: 1
            },
            {
                buttonId: 'btn_back_main',
                buttonText: {displayText: '🔙 BACK TO MAIN'},
                type: 1
            }
        ],
        headerType: 1
    };
    
    await conn.sendMessage(from, funMenu, { quoted: mek });
}

async function sendConvertMenu(conn, from, mek) {
    const convertMenu = {
        text: `╭━━〔 🔄 *CONVERT MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🏷️ sticker      • 🏷️ sticker2
┃◈┃• 😀 emojimix     • ✨ fancy
┃◈┃• 🖼️ take         • 🎵 tomp3
┃◈┃• 🗣️ tts          • 🌐 trt
┃◈┃• 🔢 base64       • 🔠 unbase64
┃◈┃• 010 binary      • 🔤 dbinary
┃◈┃• 🔗 tinyurl      • 🌐 urldecode
┃◈┃• 🌐 urlencode    • 🌐 url
┃◈┃• 🔁 repeat       • ❓ ask
┃◈┃• 📖 readmore
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

Convert and transform your content!`,
        footer: 'File and text conversion tools',
        buttons: [
            {
                buttonId: 'btn_main',
                buttonText: {displayText: '⚡ MAIN MENU'},
                type: 1
            },
            {
                buttonId: 'btn_back_main',
                buttonText: {displayText: '🔙 BACK TO MAIN'},
                type: 1
            }
        ],
        headerType: 1
    };
    
    await conn.sendMessage(from, convertMenu, { quoted: mek });
}

async function sendAIMenu(conn, from, mek) {
    const aiMenu = {
        text: `╭━━〔 🤖 *AI MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🧠 ai           • 🤖 gpt3
┃◈┃• 🤖 gpt2         • 🤖 gptmini
┃◈┃• 🤖 gpt          • 🔵 meta
┃◈┃• 📦 blackbox     • 🌈 luma
┃◈┃• 🎧 dj           • 👑 khan
┃◈┃• 🤵 jawad        • 🧠 gpt4
┃◈┃• 🔍 bing         • 🎨 imagine
┃◈┃• 🖼️ imagine2     • 🤖 copilot
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

Powered by Artificial Intelligence!`,
        footer: 'AI-powered commands and features',
        buttons: [
            {
                buttonId: 'btn_other',
                buttonText: {displayText: 'ℹ️ OTHER MENU'},
                type: 1
            },
            {
                buttonId: 'btn_back_main',
                buttonText: {displayText: '🔙 BACK TO MAIN'},
                type: 1
            }
        ],
        headerType: 1
    };
    
    await conn.sendMessage(from, aiMenu, { quoted: mek });
}

async function sendMainMenu(conn, from, mek) {
    const mainMenu = {
        text: `╭━━〔 ⚡ *MAIN MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🏓 ping         • 🏓 ping2
┃◈┃• 🚀 speed        • 📡 live
┃◈┃• 💚 alive        • ⏱️ runtime
┃◈┃• ⏳ uptime       • 📦 repo
┃◈┃• 👑 owner        • 📜 menu
┃◈┃• 📜 menu2        • 🔄 restart
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

Core bot commands and information`,
        footer: 'Essential bot commands',
        buttons: [
            {
                buttonId: 'btn_anime',
                buttonText: {displayText: '🎎 ANIME MENU'},
                type: 1
            },
            {
                buttonId: 'btn_back_main',
                buttonText: {displayText: '🔙 BACK TO MAIN'},
                type: 1
            }
        ],
        headerType: 1
    };
    
    await conn.sendMessage(from, mainMenu, { quoted: mek });
}

async function sendAnimeMenu(conn, from, mek) {
    const animeMenu = {
        text: `╭━━〔 🎎 *ANIME MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🤬 fack         • ✅ truth
┃◈┃• 😨 dare         • 🐶 dog
┃◈┃• 🐺 awoo         • 👧 garl
┃◈┃• 👰 waifu        • 🐱 neko
┃◈┃• 🧙 megnumin     • 👗 maid
┃◈┃• 👧 loli         • 🎎 animegirl
┃◈┃• 🎎 animegirl1   • 🎎 animegirl2
┃◈┃• 🎎 animegirl3   • 🎎 animegirl4
┃◈┃• 🎎 animegirl5   • 🎬 anime1
┃◈┃• 🎬 anime2       • 🎬 anime3
┃◈┃• 🎬 anime4       • 🎬 anime5
┃◈┃• 📰 animenews    • 🦊 foxgirl
┃◈┃• 🍥 naruto
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

Anime and manga related commands!`,
        footer: 'Anime content and characters',
        buttons: [
            {
                buttonId: 'btn_other',
                buttonText: {displayText: 'ℹ️ OTHER MENU'},
                type: 1
            },
            {
                buttonId: 'btn_back_main',
                buttonText: {displayText: '🔙 BACK TO MAIN'},
                type: 1
            }
        ],
        headerType: 1
    };
    
    await conn.sendMessage(from, animeMenu, { quoted: mek });
}

async function sendOtherMenu(conn, from, mek) {
    const otherMenu = {
        text: `╭━━〔 ℹ️ *OTHER MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
┃◈┃• 🕒 timenow      • 📅 date
┃◈┃• 🔢 count        • 🧮 calculate
┃◈┃• 🔢 countx       • 🎲 flip
┃◈┃• 🪙 coinflip     • 🎨 rcolor
┃◈┃• 🎲 roll         • ℹ️ fact
┃◈┃• 💻 cpp          • 🎲 rw
┃◈┃• 💑 pair         • 💑 pair2
┃◈┃• 💑 pair3        • ✨ fancy
┃◈┃• 🎨 logo <text>  • 📖 define
┃◈┃• 📰 news         • 🎬 movie
┃◈┃• ☀️ weather      • 📦 srepo
┃◈┃• 🤬 insult       • 💾 save
┃◈┃• 🌐 wikipedia    • 🔑 gpass
┃◈┃• 👤 githubstalk  • 🔍 yts
┃◈┃• 📹 ytv
┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷

Utility and miscellaneous commands`,
        footer: 'Various utility commands',
        buttons: [
            {
                buttonId: 'btn_back_main',
                buttonText: {displayText: '🔙 BACK TO MAIN'},
                type: 1
            }
        ],
        headerType: 1
    };
    
    await conn.sendMessage(from, otherMenu, { quoted: mek });


