const { cmd } = require('../command');
const config = require('../config');

const loveEmojis = [
    '💖', '❤️', '🧡', '💛', '💚', 
    '💙', '💜', '🤎', '🤍', '🖤',
    '♥️', '♦️', '💕', '💞', '💓',
    '💗', '💘', '💝', '💟', '🥰'
];

cmd({
    pattern: "lov",
    alias: ["heart"],
    desc: "Send changing love emojis in one message",
    category: "fun",
    react: "💖",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Send initial message
        let msg = await conn.sendMessage(from, { 
            text: "💖 *Love Bomb Incoming!* 💖\n\nCurrent emoji: 💖" 
        }, { quoted: mek });

        let counter = 0;
        const interval = setInterval(async () => {
            try {
                if (counter >= 20) {
                    clearInterval(interval);
                    await conn.sendMessage(from, { 
                        text: "💝 *Love session ended!*" 
                    }, { quoted: mek });
                    return;
                }

                const emoji = loveEmojis[counter % loveEmojis.length];
                
                // Edit the same message
                await conn.sendMessage(from, {
                    text: `💖 *Love Bomb Incoming!* 💖\n\nCurrent emoji: ${emoji}`,
                    edit: msg.key
                });
                
                counter++;
                
            } catch (e) {
                clearInterval(interval);
                console.error("Error updating emoji:", e);
            }
        }, 1000);

    } catch (e) {
        console.error("Initial Error:", e);
        await conn.sendMessage(from, { 
            text: "❌ Failed to start love session!" 
        }, { quoted: mek });
    }
});
