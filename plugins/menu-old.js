cmd({
    pattern: "menu3",
    desc: "Show menu with buttons",
    category: "menu",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Simple Button-Like Menu
        const menuText = `
╔═══════════════╗
      *${config.BOT_NAME}*      
╚═══════════════╝

[1] 📥 Downloads
[2] 👥 Group Tools
[3] 🎮 Fun Games
[4] 👑 Owner Commands

Reply with *Number* (1-4)
        `;

        await conn.sendMessage(from, {
            text: menuText,
            footer: config.DESCRIPTION,
            buttons: [
                { buttonId: '.dlmenu', buttonText: { displayText: '📥 Downloads' }, type: 1 },
                { buttonId: '.groupmenu', buttonText: { displayText: '👥 Group' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: mek });

    } catch (e) {
        reply(`Error: ${e.message}`);
    }
});
