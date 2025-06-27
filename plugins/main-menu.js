const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "menu2",
    desc: "Show menu with buttons",
    react: "📜",
    category: "menu"
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(
            from,
            {
                text: "📌 *Main Menu* - Tap a button below!",
                footer: config.BOT_NAME,
                buttons: [
                    { buttonId: `${config.PREFIX}owner`, buttonText: { displayText: "👑 Owner" }, type: 1 },
                    { buttonId: `${config.PREFIX}download`, buttonText: { displayText: "📥 Download" }, type: 1 },
                    { buttonId: `${config.PREFIX}vote`, buttonText: { displayText: "⭐ Vote" }, type: 1 }
                ],
                headerType: 1
            },
            { quoted: mek }
        );
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
