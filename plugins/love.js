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
    desc: "Send beautiful changing love emojis",
    category: "fun",
    react: "💖",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        // Send initial emoji
        let msg = await conn.sendMessage(from, { 
            text: loveEmojis[0] 
        }, { quoted: mek });

        let counter = 1;
        const interval = setInterval(async () => {
            try {
                if (counter >= 20) {
                    clearInterval(interval);
                    return;
                }

                const emoji = loveEmojis[counter % loveEmojis.length];
                
                // Edit the same message
                await conn.sendMessage(from, {
                    text: emoji,
                    edit: msg.key
                });
                
                counter++;
                
            } catch (e) {
                clearInterval(interval);
                console.error("Emoji update error:", e);
            }
        }, 1000); // Change every 1 second

    } catch (e) {
        console.error("Love command error:", e);
        try {
            await conn.sendMessage(from, { 
                text: "💔 Couldn't send love right now" 
            }, { quoted: mek });
        } catch (err) {
            console.error("Failed to send error message:", err);
        }
    }
});
