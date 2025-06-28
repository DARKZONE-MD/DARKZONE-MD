const { cmd } = require("../command");
const { getContentType } = require('@whiskeysockets/baileys');

cmd({
  pattern: "send",
  alias: ["sendme", 'save'],
  react: '📤',
  desc: "Forwards quoted message back to user",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    // Check if message is quoted
    if (!message.quoted) {
      return await client.sendMessage(from, {
        text: "*📤 Please reply to a message you want to save!*"
      }, { quoted: message });
    }

    const quoted = message.quoted;
    const mtype = getContentType(quoted.message);
    const options = { quoted: message };

    // Handle different message types
    switch (mtype) {
      case 'imageMessage':
      case 'stickerMessage':
        const imageBuffer = await client.downloadMediaMessage(quoted);
        return await client.sendMessage(from, {
          image: imageBuffer,
          caption: quoted.text || '',
          mimetype: quoted.mimetype || 'image/jpeg'
        }, options);

      case 'videoMessage':
        const videoBuffer = await client.downloadMediaMessage(quoted);
        return await client.sendMessage(from, {
          video: videoBuffer,
          caption: quoted.text || '',
          mimetype: quoted.mimetype || 'video/mp4'
        }, options);

      case 'audioMessage':
        const audioBuffer = await client.downloadMediaMessage(quoted);
        return await client.sendMessage(from, {
          audio: audioBuffer,
          mimetype: quoted.mimetype || 'audio/mp4',
          ptt: quoted.ptt || false
        }, options);

      case 'conversation':
      case 'extendedTextMessage':
        return await client.sendMessage(from, {
          text: quoted.text
        }, options);

      case 'documentMessage':
        const docBuffer = await client.downloadMediaMessage(quoted);
        return await client.sendMessage(from, {
          document: docBuffer,
          mimetype: quoted.mimetype,
          fileName: quoted.fileName || 'document'
        }, options);

      default:
        return await client.sendMessage(from, {
          text: "❌ Unsupported message type\nOnly images, videos, audio, text and documents are supported"
        }, options);
    }

  } catch (error) {
    console.error("Send Command Error:", error);
    await client.sendMessage(from, {
      text: `❌ Failed to send message\n*Reason:* ${error.message}`
    }, { quoted: message });
  }
});
