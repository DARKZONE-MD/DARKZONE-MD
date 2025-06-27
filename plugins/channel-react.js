const config = require('../config');
const { cmd } = require('../command');

// Stylized Characters
const stylizedChars = {
  a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
  h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
  o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
  v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
  '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
  '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
};

// Your Channel ID
const yourChannelId = "120363416743041101@newsletter"; 

// Random Emoji List
const emojis = ["❤️", "🌟", "🔥", "🌸", "🍁", "🦋", "🍥", "🎀", "👑", "🚩"];

cmd({
  pattern: "chr",
  alias: ["channelreact"],
  react: "🔤",
  desc: "React to channel posts with stylized text",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
  try {
    // ==============================================
    // 🔥 AUTO-REACT TO YOUR CHANNEL POSTS (HEART EMOJI)
    // ==============================================
    if (mek.key?.remoteJid === yourChannelId) {
      const messageId = mek.key.id;
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      await conn.sendMessage(yourChannelId, {
        react: {
          text: randomEmoji,
          key: mek.key
        }
      });
      return;
    }

    // ==============================================
    // ✨ MANUAL REACT COMMAND (.chr <link> <text>)
    // ==============================================
    if (!q) return reply(`❌ Usage: .chr <channel-link> <text>\nExample: .chr https://whatsapp.com/channel/123456 hello`);

    const [link, ...textParts] = q.split(' ');
    if (!link.includes("whatsapp.com/channel/")) return reply("❌ Invalid channel link format");

    const text = textParts.join(' ').toLowerCase();
    if (!text) return reply("❌ Please provide text to convert");

    // Convert text to stylized characters
    const styledText = text.split('').map(char => stylizedChars[char] || char).join('');

    // Extract channel ID and message ID from link
    const parts = link.split('/');
    const channelId = parts[4];
    const messageId = parts[5];

    if (!channelId || !messageId) return reply("❌ Invalid link - missing IDs");

    // Send reaction
    await conn.sendMessage(channelId+'@newsletter', {
      react: {
        text: styledText,
        key: { id: messageId, remoteJid: channelId+'@newsletter' }
      }
    });

    reply(`✅ Success! Reacted with:\n${styledText}`);

  } catch (e) {
    console.error("CHR Error:", e);
    reply(`❌ Error: ${e.message || "Failed to react"}`);
  }
});
