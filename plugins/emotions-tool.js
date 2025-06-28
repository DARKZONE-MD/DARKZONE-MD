const { cmd } = require('../command');
const config = require('../config');

// Emotion sets
const emotionEmojis = {
    love: ['💖', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🤍', '🖤', '♥️', '♦️', '💕', '💞', '💓', '💗', '💘', '💝', '💟', '🥰'],
    shy: ['😊', '😳', '🥺', '😌', '😶', '🫣', '😚', '😙', '😽', '🙈'],
    sad: ['😢', '😭', '😞', '😔', '😟', '😕', '🙁', '☹️', '🥲', '💔'],
    happy: ['😀', '😃', '😄', '😁', '😆', '🥰', '😍', '🤩', '😊', '😸'],
    hurt: ['🤕', '😣', '😖', '😫', '😩', '🥵', '🥶', '😤', '😠', '💢'],
    broken: ['💔', '😿', '🌑', '🌘', '🌗', '🌖', '🌕', '🌒', '🌓', '🌔'],
    hot: ['🥵', '♨️', '🔥', '🌶️', '☀️', '🏜️', '🫠', '😓', '😰', '🥴'],
    beautiful: ['✨', '🌟', '💫', '🌠', '🌌', '🌹', '🏵️', '🌸', '💮', '🏆']
};

// Function to handle emotion display
async function showEmotion(conn, from, mek, emotion) {
    try {
        // Send initial emoji
        let msg = await conn.sendMessage(from, { 
            text: emotionEmojis[emotion][0] 
        }, { quoted: mek });

        let counter = 1;
        const interval = setInterval(async () => {
            try {
                const emoji = emotionEmojis[emotion][counter % emotionEmojis[emotion].length];
                
                // Edit the same message
                await conn.sendMessage(from, {
                    text: emoji,
                    edit: msg.key
                });
                
                counter++;
                
            } catch (e) {
                clearInterval(interval);
                console.error(`Error updating ${emotion} emoji:`, e);
            }
        }, 800); // Change every 0.8 seconds

    } catch (e) {
        console.error(`Initial ${emotion} error:`, e);
        await conn.sendMessage(from, { 
            text: `❌ Couldn't show ${emotion} right now` 
        }, { quoted: mek });
    }
}

// Love command
cmd({
    pattern: "love",
    alias: ["heart"],
    desc: "Show continuous love emojis",
    category: "fun",
    react: "❤️",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    await showEmotion(conn, from, mek, 'love');
});

// Shy command
cmd({
    pattern: "shy",
    desc: "Show shy emojis",
    category: "fun",
    react: "😊",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    await showEmotion(conn, from, mek, 'shy');
});

// Sad command
cmd({
    pattern: "sad",
    desc: "Show sad emojis",
    category: "fun",
    react: "😢",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    await showEmotion(conn, from, mek, 'sad');
});

// Happy command
cmd({
    pattern: "happy",
    desc: "Show happy emojis",
    category: "fun",
    react: "😄",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    await showEmotion(conn, from, mek, 'happy');
});

// Hurt command
cmd({
    pattern: "hurt",
    desc: "Show hurt emojis",
    category: "fun",
    react: "🤕",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    await showEmotion(conn, from, mek, 'hurt');
});

// Broken command
cmd({
    pattern: "broken",
    desc: "Show broken heart/moon emojis",
    category: "fun",
    react: "💔",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    await showEmotion(conn, from, mek, 'broken');
});

// Hot command
cmd({
    pattern: "hot",
    desc: "Show hot emojis",
    category: "fun",
    react: "🥵",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    await showEmotion(conn, from, mek, 'hot');
});

// Beautiful command
cmd({
    pattern: "beautiful",
    alias: ["beauty"],
    desc: "Show beautiful emojis",
    category: "fun",
    react: "✨",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    await showEmotion(conn, from, mek, 'beautiful');
});
