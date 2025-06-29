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

// Track active animations to prevent duplicates
const activeAnimations = new Map();

// Optimized function to handle emotion display
async function showEmotion(conn, from, mek, emotion) {
    const chatKey = `${from}_${emotion}`;
    
    // Clear any existing animation for this chat+emotion
    if (activeAnimations.has(chatKey)) {
        clearInterval(activeAnimations.get(chatKey));
        activeAnimations.delete(chatKey);
    }

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
                activeAnimations.delete(chatKey);
                console.error(`Error updating ${emotion} emoji:`, e);
            }
        }, 1000); // Changed to 1 second interval for better performance

        // Store the interval reference
        activeAnimations.set(chatKey, interval);
        
        // Auto-stop after 30 seconds to prevent memory leaks
        setTimeout(() => {
            if (activeAnimations.has(chatKey)) {
                clearInterval(activeAnimations.get(chatKey));
                activeAnimations.delete(chatKey);
            }
        }, 30000);

    } catch (e) {
        console.error(`Initial ${emotion} error:`, e);
        await conn.sendMessage(from, { 
            text: `❌ Couldn't show ${emotion} right now` 
        }, { quoted: mek });
    }
}

// Command handler factory to reduce repetitive code
function createEmotionCommand(pattern, emotion, alias = [], react = "❤️") {
    cmd({
        pattern,
        alias,
        desc: `Show continuous ${emotion} emojis`,
        category: "fun",
        react,
        filename: __filename
    }, async (conn, mek, m, { from }) => {
        await showEmotion(conn, from, mek, emotion);
    });
}

// Create all emotion commands
createEmotionCommand("love", "love", ["heart"], "❤️");
createEmotionCommand("shy", "shy", [], "😊");
createEmotionCommand("sad", "sad", [], "😢");
createEmotionCommand("happy", "happy", [], "😄");
createEmotionCommand("hurt", "hurt", [], "🤕");
createEmotionCommand("broken", "broken", [], "💔");
createEmotionCommand("hot", "hot", [], "🥵");
createEmotionCommand("beautiful", "beautiful", ["beauty"], "✨");
