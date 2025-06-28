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
    pattern: "love",
    alias: ["heart", "emoji"],
    desc: "Send continuous love emoji reactions",
    category: "fun",
    react: "💖",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Send initial message
        const message = await reply("💖 *Love Bomb Incoming!* 💖\n\nI'll keep sending love emojis...");

        // Get message ID to react to
        const messageId = message.key.id;
        
        // Start emoji rotation
        let counter = 0;
        const interval = setInterval(async () => {
            try {
                // Cycle through emojis
                const emoji = loveEmojis[counter % loveEmojis.length];
                
                // Add reaction to the original message
                await conn.sendMessage(from, {
                    react: {
                        text: emoji,
                        key: message.key
                    }
                });
                
                counter++;
                
                // Stop after 20 rotations (or adjust as needed)
                if (counter >= 20) {
                    clearInterval(interval);
                    await reply("💝 *Love session ended!*");
                }
            } catch (e) {
                clearInterval(interval);
                console.error("Love Error:", e);
            }
        }, 1000); // Change emoji every 1 second

    } catch (e) {
        console.error("Initial Love Error:", e);
        reply("❌ Failed to spread love!");
    }
});
