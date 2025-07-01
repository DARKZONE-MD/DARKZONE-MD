////==========\
const { cmd } = require('../command');

// Helper function for animated emoji messages
async function sendEmojiAnimation(conn, from, initialEmoji, emojiSequence, speed = 800) {
    try {
        const message = await conn.sendMessage(from, { text: initialEmoji });
        
        for (const emoji of emojiSequence) {
            await new Promise(resolve => setTimeout(resolve, speed));
            await conn.relayMessage(from, {
                protocolMessage: {
                    key: message.key,
                    type: 14, // Edited message type
                    editedMessage: { conversation: emoji }
                }
            });
        }
    } catch (error) {
        console.error('Emoji animation error:', error);
        throw error;
    }
}

// Love Command
cmd({
    pattern: "love",
    alias: ["heart", "luv"],
    desc: "Heart emoji animation",
    category: "fun",
    react: "❤️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '❤️', [
            "💘", "💝", "💖", "💗", "💓", "💞", 
            "💕", "💟", "❣️", "💔", "❤️‍🔥", "❤️‍🩹",
            "💌", "🧡", "💛", "💚", "💙", "💜",
            "🤎", "🖤", "🤍", "❤️"
        ], 600);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Happy Command
cmd({
    pattern: "happy",
    alias: ["happiness", "joy"],
    desc: "Happy emoji animation",
    category: "fun",
    react: "😊",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '😊', [
            "😀", "😃", "😄", "😁", "😆", "😅",
            "😂", "🤣", "🥲", "☺️", "😊", "😇",
            "🙂", "🙃", "😉", "😌", "😍", "🥰",
            "😘", "😗", "😙", "😚", "😋", "😛",
            "😝", "😜", "🤪", "🤨", "🧐", "🤓",
            "😎", "🥸", "🤩", "🥳", "😏", "😊"
        ]);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Sad Command
cmd({
    pattern: "sad",
    alias: ["depressed", "cry"],
    desc: "Sad emoji animation",
    category: "fun",
    react: "😢",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '😢', [
            "😞", "😔", "😟", "😕", "🙁", "☹️",
            "😣", "😖", "😫", "😩", "🥺", "😢",
            "😭", "😤", "😠", "😡", "🤬", "😓",
            "😥", "😰", "😨", "😧", "😦", "😮",
            "😯", "😲", "😳", "😵", "😱", "🥶",
            "😶", "😶‍🌫️", "😢"
        ], 900);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Shy Command
cmd({
    pattern: "shy",
    alias: ["blush", "embarrassed"],
    desc: "Shy emoji animation",
    category: "fun",
    react: "🥺",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '🥺', [
            "😳", "😊", "😌", "😚", "😙", "😗",
            "😘", "🥰", "😍", "🤩", "😇", "☺️",
            "🙈", "🙉", "🙊", "💘", "💝", "💖",
            "💗", "💓", "💞", "💕", "🥺"
        ]);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Beautiful Command
cmd({
    pattern: "beautiful",
    alias: ["pretty", "gorgeous"],
    desc: "Beautiful emoji animation",
    category: "fun",
    react: "🌸",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '🌸', [
            "💐", "🌷", "🌹", "🥀", "🌺", "🌻",
            "🌼", "🌞", "⭐", "🌟", "✨", "💫",
            "🌈", "☀️", "🌤️", "🌥️", "🌦️", "🌧️",
            "🌨️", "🌩️", "🌪️", "🌫️", "🌊", "💧",
            "💦", "☔", "❄️", "⛄", "🔥", "🌸"
        ], 700);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Confused Command
cmd({
    pattern: "confused",
    alias: ["cunfuzed", "what"],
    desc: "Confused emoji animation",
    category: "fun",
    react: "😕",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '😕', [
            "🤔", "😐", "😑", "😶", "😶‍🌫️", "🙄",
            "😏", "😣", "😖", "😫", "😩", "🥺",
            "😮", "😯", "😲", "😳", "🥴", "😵",
            "😵‍💫", "🤯", "🤠", "🥸", "😎", "🧐",
            "🤓", "👽", "🤖", "👻", "💀", "😕"
        ], 800);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Moon Command
cmd({
    pattern: "moon",
    alias: ["luna", "lunar"],
    desc: "Moon phase animation",
    category: "fun",
    react: "🌑",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '🌑', [
            "🌒", "🌓", "🌔", "🌕", "🌖", "🌗",
            "🌘", "🌑", "🌙", "🌚", "🌛", "🌜",
            "🌝", "🌞", "⭐", "🌟", "✨", "💫",
            "🌠", "🌌", "🪐", "🔭", "🌑"
        ], 500);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Kiss Command
cmd({
    pattern: "kiss",
    alias: ["smooch", "loveyou"],
    desc: "Kissing emoji animation",
    category: "fun",
    react: "💋",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '💋', [
            "😘", "😗", "😙", "😚", "🥰", "😍",
            "🤩", "😻", "💌", "💘", "💝", "💖",
            "💗", "💓", "💞", "💕", "💟", "❣️",
            "💔", "❤️‍🔥", "❤️‍🩹", "💋"
        ], 600);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Hurt Command
cmd({
    pattern: "hurt",
    alias: ["pain", "injured"],
    desc: "Hurt emoji animation",
    category: "fun",
    react: "🤕",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '🤕', [
            "😣", "😖", "😫", "😩", "🥺", "😢",
            "😭", "😤", "😠", "😡", "🤬", "😓",
            "😥", "😰", "😨", "😧", "😦", "😮",
            "😯", "😲", "😳", "😵", "😵‍💫", "🤯",
            "🥴", "🤢", "🤮", "🤧", "😷", "🤒",
            "🤕", "🩹", "💊", "💉", "🩸", "🤕"
        ], 800);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Broke Command
cmd({
    pattern: "broke",
    alias: ["broken", "poor"],
    desc: "Broke emoji animation",
    category: "fun",
    react: "💔",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '💔', [
            "😞", "😔", "😟", "😕", "🙁", "☹️",
            "😣", "😖", "😫", "😩", "🥺", "😢",
            "😭", "😤", "😠", "😡", "🤬", "😓",
            "😥", "😰", "😨", "😧", "😦", "😮",
            "😯", "😲", "😳", "😵", "😱", "🥶",
            "💸", "💰", "💳", "🧾", "💔"
        ], 700);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Hot Command
cmd({
    pattern: "hot",
    alias: ["sexy", "attractive"],
    desc: "Hot emoji animation",
    category: "fun",
    react: "🔥",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await sendEmojiAnimation(conn, from, '🔥', [
            "🥵", "❤️‍🔥", "💯", "♨️", "🌶️", "🥵",
            "😈", "👿", "💦", "🍑", "🍆", "💋",
            "👄", "👅", "🫦", "👀", "👁️", "🔥"
        ], 600);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
