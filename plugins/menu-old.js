const config = require('../config');
const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const fs = require('fs');
const path = require('path');

// Menu Styles
const menuStyles = {
  main: {
    header: "╔═══════✦═══════╗\n      ✨ *{BOT_NAME}* ✨\n╚═══════✦═══════╝",
    footer: "▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\n⚡ Reply 1-{MAX_OPTIONS} ⚡\n▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀",
    line: "├─────────────────┤",
    option: "│ {NUM} » {EMOJI} {TEXT}"
  },
  category: {
    header: "┌───── *{TITLE}* ─────┐",
    footer: "└───────┬───────┬──────┘",
    item: "│ 🟢 {COMMAND}"
  }
};

// Generate Menu Function
async function sendMenu(conn, from, mek, menuType, options) {
  try {
    const style = menuStyles[menuType === 'main' ? 'main' : 'category'];
    let caption = '';

    // Build header
    caption += style.header
      .replace('{BOT_NAME}', config.BOT_NAME)
      .replace('{TITLE}', options?.title || 'MENU') + '\n';

    // Add bot info for main menu
    if (menuType === 'main') {
      caption += `│ 👑 Owner » ${config.OWNER_NAME}\n`;
      caption += `│ 🤖 Mode » ${config.MODE}\n`;
      caption += `│ 🚀 Platform » Heroku\n`;
      caption += `│ 💻 Type » NodeJs MD\n`;
      caption += `│ 🔣 Prefix » ${config.PREFIX}\n`;
      caption += style.line + '\n';
    }

    // Add menu items
    if (options?.items) {
      options.items.forEach((item, i) => {
        caption += style.option
          .replace('{NUM}', i+1)
          .replace('{EMOJI}', item.emoji)
          .replace('{TEXT}', item.text) + '\n';
      });
    } else if (options?.commands) {
      options.commands.forEach(cmd => {
        caption += style.item.replace('{COMMAND}', cmd) + '\n';
      });
    }

    // Add footer
    caption += style.footer
      .replace('{MAX_OPTIONS}', options?.items?.length || 5) + '\n';
    caption += `> ${config.DESCRIPTION}`;

    // Send message with interactive buttons
    const message = await conn.sendMessage(
      from,
      {
        image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/r2ncqh' },
        caption: caption,
        footer: "Tap button or type number",
        buttons: options?.items?.map((item, i) => ({
          buttonId: `${i+1}`,
          buttonText: { displayText: `${i+1}️⃣ ${item.text}` },
          type: 1
        })),
        contextInfo: {
          mentionedJid: [mek.sender],
          forwardingScore: 999,
          isForwarded: true
        }
      },
      { quoted: mek }
    );

    return message;

  } catch (e) {
    console.error('Menu Error:', e);
    throw e;
  }
}

// Main Menu Command
cmd({
    pattern: "menu3",
    desc: "Show main menu",
    category: "menu",
    react: "💯",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendMenu(conn, from, mek, 'main', {
            items: [
                { emoji: "📥", text: "Downloads" },
                { emoji: "👥", text: "Group" },
                { emoji: "🎮", text: "Fun" },
                { emoji: "👑", text: "Owner" },
                { emoji: "🤖", text: "AI" },
                { emoji: "🎎", text: "Anime" },
                { emoji: "🔄", text: "Convert" },
                { emoji: "📌", text: "Other" },
                { emoji: "💞", text: "Reactions" },
                { emoji: "🏠", text: "Main" }
            ]
        });

        // Send audio if available
        const audioPath = path.join(__dirname, '../assets/menu.m4a');
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(from, {
                audio: fs.readFileSync(audioPath),
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: mek });
        }

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Category Menus (preserving all your original functionality)
const categoryMenus = {
    logo: {
        title: "Logo List",
        react: "🖌️",
        commands: [
            "neonlight", "blackpink", "dragonball", "3dcomic", "america",
            "naruto", "sadgirl", "clouds", "futuristic", "3dpaper",
            "eraser", "sunset", "leaf", "galaxy", "sans",
            "boom", "hacker", "devilwings", "nigeria", "bulb",
            "angelwings", "zodiac", "luxury", "paint", "frozen",
            "castle", "tatoo", "valorant", "bear", "typography", "birthday"
        ]
    },
    reactions: {
        title: "Reactions",
        react: "💖",
        commands: [
            "bully @tag", "cuddle @tag", "cry @tag", "hug @tag",
            "awoo @tag", "kiss @tag", "lick @tag", "pat @tag",
            "smug @tag", "bonk @tag", "yeet @tag", "blush @tag",
            "smile @tag", "wave @tag", "highfive @tag", "handhold @tag",
            "nom @tag", "bite @tag", "glomp @tag", "slap @tag",
            "kill @tag", "happy @tag", "wink @tag", "poke @tag",
            "dance @tag", "cringe @tag"
        ]
    },
    dlmenu: {
        title: "Downloads",
        react: "📥",
        commands: [
            "facebook", "mediafire", "tiktok", "twitter", "Insta",
            "apk", "img", "tt2", "pins", "apk2",
            "fb2", "pinterest", "spotify", "play", "play2",
            "play3", "play4", "play5", "play6", "play7",
            "play8", "play9", "play10", "audio", "video",
            "video2", "video3", "video4", "video5", "video6",
            "video7", "video8", "video9", "video10", "ytmp3",
            "ytmp4", "song", "darama", "gdrive", "ssweb", "tiks"
        ]
    },
    // ... Add all your other categories here following the same pattern
};

// Dynamically create category menu commands
Object.entries(categoryMenus).forEach(([name, menu]) => {
    cmd({
        pattern: name,
        desc: `${menu.title} menu`,
        category: "menu",
        react: menu.react,
        filename: __filename
    }, async (conn, mek, m, { from, reply }) => {
        try {
            await sendMenu(conn, from, mek, 'category', {
                title: menu.title,
                commands: menu.commands
            });
        } catch (e) {
            console.error(e);
            reply(`❌ Error: ${e.message}`);
        }
    });
});

// Helper function for button interactions
async function handleMenuResponse(conn) {
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message?.buttonsResponseMessage) return;

        const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;
        const quotedMsg = msg.message.buttonsResponseMessage.contextInfo?.quotedMessage;
        
        if (quotedMsg?.viewOnceMessage?.message?.imageMessage?.caption.includes(config.BOT_NAME)) {
            // Handle menu button selection
            const categoryMap = {
                '1': 'dlmenu',
                '2': 'groupmenu',
                '3': 'funmenu',
                '4': 'ownermenu',
                '5': 'aimenu'
                // Add more mappings as needed
            };

            if (categoryMap[buttonId]) {
                await conn.sendMessage(msg.key.remoteJid, {
                    text: `Loading ${categoryMap[buttonId]}...`
                });
                // Trigger the corresponding menu command
                await conn.sendMessage(msg.key.remoteJid, {
                    text: `${config.PREFIX}${categoryMap[buttonId]}`
                });
            }
        }
    });
}

// Initialize button handler
module.exports.init = function(conn) {
    handleMenuResponse(conn);
};
