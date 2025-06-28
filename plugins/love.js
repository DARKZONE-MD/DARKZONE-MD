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
    desc: "Send changing love emojis",
    category: "fun",
    react: "🥺",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
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
                
                // Edit the same message with new emoji
                await conn.sendMessage(from, {
                    text: emoji,
                    edit: msg.key
                });
                
                counter++;
                
            } catch (e) {
                clearInterval(interval);
                console.error("Error updating emoji:", e);
            }
        }, 1000); // Change every 1 second

    } catch (e) {
        console.error("Initial Error:", e);
        await conn.sendMessage(from, { 
            text: "💔" 
        }, { quoted: mek });
    }
});
