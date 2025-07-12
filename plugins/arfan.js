const fs = require('fs').promises;
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

cmd({
    pattern: "fullpp",
    desc: "Set bot profile picture.",
    category: "privacy",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!quoted?.message?.imageMessage) return reply("❌ Please reply to an image.");

    let tempFilePath;
    try {
        // Download the image
        const stream = await downloadContentFromMessage(quoted.message.imageMessage, 'image');
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Create temp file path (in system temp directory)
        tempFilePath = path.join(require('os').tmpdir(), `whatsapp_pp_${Date.now()}.jpg`);
        
        // Save image to temp file
        await fs.writeFile(tempFilePath, buffer);
        
        // Update profile picture (using modern Baileys method)
        await conn.updateProfilePicture(conn.user.id, { url: tempFilePath });
        
        reply("✅ Profile picture updated successfully!");
        
    } catch (error) {
        console.error("Profile Picture Update Error:", error);
        reply(`❌ Failed to update: ${error.message}`);
    } finally {
        // Clean up temp file if it exists
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath).catch(cleanupError => 
                    console.error("Cleanup Error:", cleanupError)
                );
            } catch (e) {
                console.error("Final Cleanup Error:", e);
            }
        }
    }
});
