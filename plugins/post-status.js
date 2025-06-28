const { cmd } = require("../command");
const { getContentType } = require('@whiskeysockets/baileys');

cmd({
  pattern: "post",
  alias: ["poststatus", "status", "story", "repost", "reshare"],
  react: '📝',
  desc: "Posts replied media to bot's status",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    // Owner check
    if (!isCreator) {
      return await client.sendMessage(from, {
        text: "*📛 This is an owner-only command.*"
      }, { quoted: message });
    }

    // Get the quoted message or use the current message
    const quotedMsg = message.quoted || message;
    const mtype = getContentType(quotedMsg.message);
    
    // Validate media type
    if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(mtype)) {
      return await client.sendMessage(from, {
        text: "*❌ Please reply to an image, video, or audio message*"
      }, { quoted: message });
    }

    // Download the media
    const buffer = await client.downloadMediaMessage(quotedMsg);
    const caption = quotedMsg.text || '';

    // Prepare status update
    const statusUpdate = {
      [mtype.replace('Message', '')]: buffer,
      caption: caption,
      mimetype: quotedMsg.mimetype || 
        (mtype === 'imageMessage' ? 'image/jpeg' : 
         mtype === 'videoMessage' ? 'video/mp4' : 'audio/mp4')
    };

    // Post to status
    await client.sendMessage("status@broadcast", statusUpdate);

    // Confirm success
    await client.sendMessage(from, {
      text: "✅ *Status updated successfully!*"
    }, { quoted: message });

  } catch (error) {
    console.error("Status Post Error:", error);
    await client.sendMessage(from, {
      text: `❌ *Failed to post status:*\n${error.message}`
    }, { quoted: message });
  }
});
