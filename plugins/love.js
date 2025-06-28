const { cmd } = require('../command');
const config = require('../config');

// Array of love emojis to cycle through
const loveEmojis = [
    '💖', '❤️', '🧡', '💛', '💚', 
    '💙', '💜', '🤎', '🤍', '🖤',
    '♥️', '♦️', '💕', '💞', '💓',
    '💗', '💘', '💝', '💟', '🥰'
];

cmd({
    pattern: "lov",
    alias: ["heart", "emoji"],
    desc: "Send continuous love emoji reactions",
    category: "fun",
    react: "💖",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Send initial message
        const sentMsg = await conn.sendMessage(from, { 
            text: "💖 *Love Bomb Incoming!* 💖\n\nI'll keep sending love emojis..." 
        }, { quoted: mek });

        // Start emoji rotation
        let counter = 0;
        const interval = setInterval(async () => {
            try {
                if (counter >= 20) {
                    clearInterval(interval);
                    await conn.sendMessage(from, { text: "💝 *Love session ended!*" }, { quoted: mek });
                    return;
                }

                const emoji = loveEmojis[counter % loveEmojis.length];
                
                // Send as new message instead of react
                await conn.sendMessage(from, { 
                    text: emoji 
                }, { quoted: mek });
                
                counter++;
                
            } catch (e) {
                clearInterval(interval);
                console.error("Love Error:", e);
            }
        }, 1000); // Change emoji every 1 second

    } catch (e) {
        console.error("Initial Love Error:", e);
        await conn.sendMessage(from, { 
            text: "❌ Failed to spread love! Maybe try again later." 
        }, { quoted: mek });
    }
});
