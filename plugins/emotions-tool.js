// File: plugins/emoji-animations.js
const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

// Helper function to safely send animated messages
async function animateEmojis(conn, from, initialEmoji, emojiSequence, delay = 800) {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: initialEmoji });
        
        for (const emoji of emojiSequence) {
            await new Promise(resolve => setTimeout(resolve, delay));
            try {
                await conn.relayMessage(
                    from,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14, // Edited message type
                            editedMessage: {
                                conversation: emoji,
                            },
                        },
                    },
                    {}
                );
            } catch (editError) {
                console.error('Edit error:', editError);
                // If editing fails, send as new message
                await conn.sendMessage(from, { text: emoji });
            }
        }
    } catch (e) {
        console.error('Animation error:', e);
        throw e;
    }
}

// Command configurations
const emojiCommands = [
    {
        pattern: "happy",
        desc: "Happy emoji animation",
        react: "😊",
        emojis: ["😀", "😃", "😄", "😁", "😆", "🥹", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇"]
    },
    {
        pattern: "heart",
        desc: "Heart emoji animation",
        react: "❤️",
        emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💟"]
    },
    {
        pattern: "sad",
        desc: "Sad emoji animation",
        react: "😢",
        emojis: ["😔", "😟", "🙁", "☹️", "😕", "😞", "😢", "😥", "😪", "😭", "😿", "💔"]
    },
    {
        pattern: "shy",
        desc: "Shy emoji animation",
        react: "😳",
        emojis: ["🥺", "😳", "😊", "😚", "😙", "😗", "😘", "😍", "🤩", "🥰", "😇", "🙈", "🙊"]
    },
    {
        pattern: "beautiful",
        desc: "Beautiful emoji animation",
        react: "✨",
        emojis: ["✨", "🌟", "💫", "⭐️", "🌠", "🌞", "🌝", "🌹", "🥀", "🌺", "🌸", "🌼", "🌷"]
    },
    {
        pattern: "confused",
        desc: "Confused emoji animation",
        react: "🤔",
        emojis: ["🤔", "😕", "😟", "🙁", "😮", "😯", "😲", "😳", "🥴", "😵", "😵‍💫", "🧐"]
    },
    {
        pattern: "moon",
        desc: "Moon phase animation",
        react: "🌚",
        emojis: ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘", "🌑", "🌙", "🌚", "🌛", "🌜"]
    },
    {
        pattern: "kiss",
        desc: "Kiss emoji animation",
        react: "💋",
        emojis: ["💋", "😘", "😗", "😙", "😚", "🥰", "😍", "🤩", "❤️", "💝", "💘", "💖"]
    },
    {
        pattern: "hurt",
        desc: "Hurt emoji animation",
        react: "💔",
        emojis: ["💔", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😿", "🤕", "🥴", "😵"]
    },
    {
        pattern: "broke",
        desc: "Broken heart animation",
        react: "💔",
        emojis: ["💔", "🖤", "💔", "🖤", "💔", "🖤", "💔", "🖤", "💔", "🖤", "💔"]
    },
    {
        pattern: "hot",
        desc: "Hot emoji animation",
        react: "🔥",
        emojis: ["🔥", "🥵", "♨️", "🌶️", "🧨", "💥", "🤯", "👹", "💫", "✨", "🌟", "⭐️"]
    },
    {
        pattern: "luv",
        desc: "Love emoji animation",
        react: "🥰",
        emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💖", "💗", "💓", "💞", "💕", "💘", "💝", "💟", "❣️", "💌", "🥰"]
    }
];

// Register all commands
emojiCommands.forEach(cmdConfig => {
    cmd({
        pattern: cmdConfig.pattern,
        desc: cmdConfig.desc,
        category: "fun",
        react: cmdConfig.react,
        filename: __filename
    }, async (conn, mek, m, { from, reply }) => {
        try {
            await animateEmojis(conn, from, cmdConfig.emojis[0], cmdConfig.emojis);
        } catch (e) {
            console.error(`Error in ${cmdConfig.pattern}:`, e);
            reply(`❌ Failed to animate ${cmdConfig.pattern} emojis`);
        }
    });
});

// Save the plugin information
const pluginInfo = {
    name: "Emoji Animations",
    desc: "Auto-changing emoji animations for various emotions",
    version: "1.0",
    author: "Your Name"
};

fs.writeFileSync(
    path.join(__dirname, 'emoji-animations.json'),
    JSON.stringify(pluginInfo, null, 2)
);
