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
} = require('@whiskeysockets/baileys')

const l = console.log
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data')
const fs = require('fs')
const ff = require('fluent-ffmpeg')
const P = require('pino')
const config = require('./config')
const GroupEvents = require('./lib/groupevents')
const qrcode = require('qrcode-terminal')
const StickersTypes = require('wa-sticker-formatter')
const util = require('util')
const { sms, downloadMediaMessage, AntiDelete } = require('./lib')
const FileType = require('file-type')
const axios = require('axios')
const { File } = require('megajs')
const { fromBuffer } = require('file-type')
const bodyparser = require('body-parser')
const os = require('os')
const Crypto = require('crypto')
const path = require('path')
const prefix = config.PREFIX || '.'

const ownerNumber = ['923306137477']

const tempDir = path.join(os.tmpdir(), 'cache-temp')
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
}

const clearTempDir = () => {
    fs.readdir(tempDir, (err, files) => {
        if (err) throw err
        for (const file of files) {
            fs.unlink(path.join(tempDir, file), err => {
                if (err) throw err
            })
        }
    })
}

// Clear the temp directory every 5 minutes
setInterval(clearTempDir, 5 * 60 * 1000)

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if(!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!')
    const sessdata = config.SESSION_ID.replace("IK~", '')
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
    filer.download((err, data) => {
        if(err) throw err
        fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
            console.log("Session downloaded ✅")
        })
    })
}

const express = require("express")
const app = express()
const port = process.env.PORT || 9090

// Store initialization
const store = makeInMemoryStore({ logger: P().child({ level: 'silent', stream: 'store' }) })

async function connectToWA() {
    console.log("Connecting to WhatsApp ⏳️...")
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/')
    var { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true, // Changed to true for debugging
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    })
    
    // Bind store to connection
    store.bind(conn.ev)
    
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log('Connection closed, reconnecting...')
                setTimeout(connectToWA, 5000)
            } else {
                console.log('Connection closed, you are logged out.')
            }
        } else if (connection === 'open') {
            console.log('🧬 Installing Plugins')
            const path = require('path')
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin)
                }
            })
            console.log('Plugins installed successful ✅')
            console.log('Bot connected to whatsapp ✅')

            let greetings = [
                "🤖 DARKZONE-MD BOT",
                "🚀 DARKZONE-MD ONLINE",
                "👾 POWERED BY DARKZONE",
                "💡 INTELLIGENT BOT SYSTEM"
            ]

            let subtitles = [
                "Ultra-Fast | Secure | Smart",
                "Stable | Reliable | Instant",
                "Modern | Lightweight | Intelligent",
                "The Future of WhatsApp Bots"
            ]

            let outro = [
                "Thanks for choosing DARKZONE-MD!",
                "Powered by *𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟💻*",
                "Built for your convenience ⚡",
                "Leveling up your automation 🛠"
            ]

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
⭐ *GitHub:* github.com/DARKZONE-MD/DARKZONE-MD.git`

            conn.sendMessage(conn.user.id, { 
                image: { url: `https://files.catbox.moe/r2ncqh` }, 
                caption: up 
            }).catch(e => console.log('Error sending connection message:', e))
        }
    })
    
    conn.ev.on('creds.update', saveCreds)

    // Message update handler for deleted messages
    conn.ev.on('messages.update', async updates => {
        for (const update of updates) {
            if (update.update.message === null) {
                console.log("Delete Detected:", JSON.stringify(update, null, 2))
                await AntiDelete(conn, updates).catch(e => console.log('AntiDelete error:', e))
            }
        }
    })
    
    // Group participants update handler
    conn.ev.on("group-participants.update", (update) => {
        GroupEvents(conn, update).catch(e => console.log('GroupEvents error:', e))
    })	  
    
    // Main message handler
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0]
        if (!mek.message) return
        
        try {
            // Process message content
            mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
                ? mek.message.ephemeralMessage.message 
                : mek.message
            
            if (mek.message.viewOnceMessageV2) {
                mek.message = mek.message.viewOnceMessageV2.message
            }

            // Mark as read if enabled
            if (config.READ_MESSAGE === 'true') {
                await conn.readMessages([mek.key]).catch(e => console.log('Read error:', e))
                console.log(`Marked message from ${mek.key.remoteJid} as read.`)
            }
            
            // Status auto-reply
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                if (config.AUTO_STATUS_SEEN === "true") {
                    await conn.readMessages([mek.key]).catch(e => console.log('Status read error:', e))
                }
                
                if (config.AUTO_STATUS_REACT === "true") {
                    const jawadlike = await conn.decodeJid(conn.user.id)
                    const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚']
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
                    await conn.sendMessage(mek.key.remoteJid, {
                        react: {
                            text: randomEmoji,
                            key: mek.key,
                        } 
                    }, { statusJidList: [mek.key.participant, jawadlike] }).catch(e => console.log('React error:', e))
                }                       
                
                if (config.AUTO_STATUS_REPLY === "true") {
                    const user = mek.key.participant
                    const text = config.AUTO_STATUS_MSG || "Thanks for your status update!"
                    await conn.sendMessage(user, { 
                        text: text, 
                        react: { text: '💜', key: mek.key } 
                    }, { quoted: mek }).catch(e => console.log('Status reply error:', e))
                }
            }
            
            // Save message to database
            await saveMessage(mek).catch(e => console.log('Save message error:', e))
            
            // Prepare message context
            const m = sms(conn, mek, store)
            const type = getContentType(mek.message)
            const from = mek.key.remoteJid
            const quoted = type === 'extendedTextMessage' && mek.message.extendedTextMessage?.contextInfo 
                ? mek.message.extendedTextMessage.contextInfo.quotedMessage 
                : null
            
            const body = (type === 'conversation') 
                ? mek.message.conversation 
                : (type === 'extendedTextMessage') 
                    ? mek.message.extendedTextMessage.text 
                    : (type === 'imageMessage') 
                        ? mek.message.imageMessage.caption 
                        : (type === 'videoMessage') 
                            ? mek.message.videoMessage.caption 
                            : ''
            
            const isCmd = body?.startsWith(prefix)
            const budy = typeof mek.text === 'string' ? mek.text : ''
            const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : ''
            const args = body?.trim().split(/ +/).slice(1) || []
            const q = args.join(' ')
            const text = args.join(' ')
            const isGroup = from.endsWith('@g.us')
            const sender = mek.key.fromMe 
                ? conn.user.id 
                : mek.key.participant || mek.key.remoteJid
            const senderNumber = sender.split('@')[0]
            const botNumber = conn.user.id.split(':')[0]
            const pushname = mek.pushName || 'Sin Nombre'
            const isMe = botNumber.includes(senderNumber)
            const isOwner = ownerNumber.includes(senderNumber) || isMe
            const botNumber2 = await jidNormalizedUser(conn.user.id)
            
            let groupMetadata = null
            let participants = []
            let groupAdmins = []
            
            if (isGroup) {
                try {
                    groupMetadata = await conn.groupMetadata(from)
                    participants = groupMetadata.participants
                    groupAdmins = await getGroupAdmins(participants)
                } catch (e) {
                    console.log('Group metadata error:', e)
                }
            }
            
            const groupName = groupMetadata?.subject || ''
            const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
            const isAdmins = isGroup ? groupAdmins.includes(sender) : false
            const isReact = m.message?.reactionMessage ? true : false
            
            const reply = (teks) => {
                conn.sendMessage(from, { text: teks }, { quoted: mek }).catch(e => console.log('Reply error:', e))
            }

            // Check for banned users
            const bannedUsers = JSON.parse(fs.readFileSync('./lib/ban.json', 'utf-8') || '[]')
            const isBanned = bannedUsers.includes(sender)
            if (isBanned) return
            
            // Check owner/sudo permissions
            const ownerFile = JSON.parse(fs.readFileSync('./lib/sudo.json', 'utf-8') || '[]')
            const ownerNumberFormatted = config.OWNER_NUMBER ? `${config.OWNER_NUMBER}@s.whatsapp.net` : ''
            const isFileOwner = ownerFile.includes(sender)
            const isRealOwner = sender === ownerNumberFormatted || isMe || isFileOwner
            
            // Mode checking
            if (!isRealOwner && config.MODE === "private") return
            if (!isRealOwner && isGroup && config.MODE === "inbox") return
            if (!isRealOwner && !isGroup && config.MODE === "groups") return
            
            // Auto-react to messages
            if (!isReact && config.AUTO_REACT === 'true') {
                const reactions = (config.CUSTOM_REACT === 'true' && config.CUSTOM_REACT_EMOJIS) 
                    ? config.CUSTOM_REACT_EMOJIS.split(',') 
                    : ['❤️', '😂', '👍', '🔥', '🥰', '👏', '🎉', '🤩', '🙏', '💯']
                
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
                await conn.sendMessage(from, {
                    react: {
                        text: randomReaction,
                        key: mek.key
                    }
                }).catch(e => console.log('Auto-react error:', e))
            }
            
            // Handle commands
            if (isCmd) {
                const events = require('./command')
                const cmdName = command.toLowerCase()
                const cmd = events.commands.find(c => c.pattern === cmdName) || 
                           events.commands.find(c => c.alias?.includes(cmdName))
                
                if (cmd) {
                    try {
                        // Send reaction if defined
                        if (cmd.react) {
                            await conn.sendMessage(from, { 
                                react: { 
                                    text: cmd.react, 
                                    key: mek.key 
                                } 
                            }).catch(e => console.log('Command react error:', e))
                        }
                        
                        // Execute command
                        await cmd.function(conn, mek, m, {
                            from, quoted, body, isCmd, command: cmdName, args, q, text, 
                            isGroup, sender, senderNumber, botNumber2, botNumber, 
                            pushname, isMe, isOwner, isCreator: isRealOwner, 
                            groupMetadata, groupName, participants, groupAdmins, 
                            isBotAdmins, isAdmins, reply
                        })
                    } catch (e) {
                        console.error("[COMMAND ERROR]", cmdName, e)
                        reply(`❌ Error executing command: ${e.message}`)
                    }
                }
            }
            
        } catch (error) {
            console.error('Message processing error:', error)
        }
    })
    
    // Utility functions
    conn.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return (decode.user && decode.server)
                ? `${decode.user}@${decode.server}`
                : jid
        } else return jid
    }
    
    // Add other utility functions (sendFile, sendImage, etc.) here...
    // ... [Keep all the utility functions from your original code]
    
    // Error handling for the connection
    conn.ev.on('connection.update', (update) => {
        if (update.connection === 'close') {
            console.log('Connection closed, attempting to reconnect...')
            setTimeout(connectToWA, 5000)
        }
    })
}

// Start the server
app.get("/", (req, res) => {
    res.send("DARKZONE-MD STARTED ✅")
})

app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`)
    // Start WhatsApp connection after server starts
    setTimeout(connectToWA, 2000)
})
