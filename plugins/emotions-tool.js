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
  generateMessageID, makeInMemoryStore,
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
    fs.mkdirSync(tempDir);
}

const clearTempDir = () => {
    fs.readdir(tempDir, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(tempDir, file), err => {
                if (err) throw err;
            });
        }
    });
};

setInterval(clearTempDir, 5 * 60 * 1000);

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if(!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
    const sessdata = config.SESSION_ID.replace("IK~", '');
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
        if(err) throw err;
        fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
            console.log("Session downloaded ✅");
        });
    });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

//=============================================

async function connectToWA() {
    console.log("Connecting to WhatsApp ⏳️...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
    var { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    });

    // Store for caching
    const store = makeInMemoryStore({ logger: P().child({ level: 'silent', stream: 'store' }) });
    store.bind(conn.ev);

    // Optimized group participants update handler
    conn.ev.on('group-participants.update', async (update) => {
        try {
            // Auto-admin request when bot is added
            if (update.action === 'add' && update.participants.includes(conn.user.id)) {
                const groupMetadata = await conn.groupMetadata(update.id);
                const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                
                if (!admins.includes(conn.user.id)) {
                    const adder = admins.length > 0 ? admins[0] : update.participants[0];
                    await conn.sendMessage(update.id, { 
                        text: `@${adder.split('@')[0]} Please make me admin using *${prefix}admin* command for full functionality!`,
                        mentions: [adder]
                    });
                }
            }
            
            // Process other group events
            GroupEvents(conn, update);
        } catch (error) {
            console.error('Error in group-participants.update:', error);
        }
    });

    // Faster status view handler
    conn.ev.on('messages.upsert', async(mek) => {
        mek = mek.messages[0];
        if (!mek.message) return;
        
        mek.message = (getContentType(mek.message) === 'ephemeralMessage' 
            ? mek.message.ephemeralMessage.message 
            : mek.message;

        // Mark messages as read
        if (config.READ_MESSAGE === 'true') {
            await conn.readMessages([mek.key]);
        }

        // Faster status view and reaction
        if (mek.key && mek.key.remoteJid === 'status@broadcast') {
            if (config.AUTO_STATUS_SEEN === "true") {
                await conn.readMessages([mek.key]);
            }
            
            if (config.AUTO_STATUS_REACT === "true") {
                const erfanlike = await conn.decodeJid(conn.user.id);
                const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await conn.sendMessage(mek.key.remoteJid, {
                    react: {
                        text: randomEmoji,
                        key: mek.key,
                    } 
                }, { statusJidList: [mek.key.participant, erfanlike] });
            }
            
            if (config.AUTO_STATUS_REPLY === "true" && mek.key.participant) {
                const user = mek.key.participant;
                const text = `${config.AUTO_STATUS_MSG}`;
                await conn.sendMessage(user, { text: text, react: { text: '💜', key: mek.key } }, { quoted: mek });
            }
        }

        await saveMessage(mek);
        
        const m = sms(conn, mek);
        const type = getContentType(mek.message);
        const from = mek.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = mek.key.fromMe ? conn.user.id : (mek.key.participant || mek.key.remoteJid);
        
        // Rest of your message processing logic...
        // [Keep all your existing message processing code here]
    });

    // Connection events
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                connectToWA();
            }
        } else if (connection === 'open') {
            console.log('🧬 Installing Plugins');
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
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
┃ ▸ *Mode:* Public
┃ ▸ *Owner:* 𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟
┗━━━━━━━━━━━━━━━━━━━
     *channel*: https://whatsapp.com/channel/0029Vb5dDVO59PwTnL86j13J
⭐ *GitHub:* github.com/DARKZONE-MD/DARKZONE-MD.git`;

            conn.sendMessage(conn.user.id, { image: { url: `https://files.catbox.moe/r2ncqh` }, caption: up });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    // Anti-delete functionality
    conn.ev.on('messages.update', async updates => {
        for (const update of updates) {
            if (update.update.message === null) {
                await AntiDelete(conn, updates);
            }
        }
    });

    // [Keep all your existing helper functions here]
    // conn.decodeJid, conn.copyNForward, etc...
    // ...
}

app.get("/", (req, res) => {
    res.send("DARKZONE-MD STARTED ✅");
});

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
setTimeout(() => {
    connectToWA();
}, 4000);
