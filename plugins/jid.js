const { cmd } = require('../command');

cmd({
  pattern: "jid",
  alias: ["id", "chatid", "gjid"],
  desc: "Get the full JID of the chat/user (Creator only)",
  react: "🆔",
  category: "utility",
  filename: __filename,
}, async (conn, mek, m, {
  from, isGroup, isCreator, reply, sender
}) => {
  try {
    if (!isCreator) {
      return reply("❌ *Access Denied:* Only the bot creator can use this command.");
    }

    // Hidden channel link using Base64
    const hiddenLink = Buffer.from("aHR0cHM6Ly93aGF0c2FwcC5jb20vY2hhbm5lbC8wMDI5VmI1ZERYTzU5UHdUbkw4NmozMw==", "base64").toString();

    let jidText = isGroup
      ? `👥 *Group JID:*\n\`\`\`${from.includes('@g.us') ? from : from + '@g.us'}\`\`\``
      : `👤 *User JID:*\n\`\`\`${sender.includes('@s.whatsapp.net') ? sender : sender + '@s.whatsapp.net'}\`\`\``;

    // Reply with JID
    await reply(jidText);

    // Send channel link (delayed)
    await conn.sendMessage(from, {
      text: `📢 *Stay Updated!*\nJoin My Official Channel:\n${hiddenLink}`
    }, { quoted: mek });

  } catch (err) {
    console.error("JID Command Error:", err);
    reply("⚠️ Something went wrong:\n" + err.message);
  }
});
