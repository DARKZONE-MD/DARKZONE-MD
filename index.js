// =================================================================
// ----------------- IMPORTS & INITIAL SETUP -----------------------
// =================================================================
// Using modern, stable imports from the Baileys library.
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    proto,
    fetchLatestBaileysVersion,
    Browsers,
    makeInMemoryStore,
    jidDecode
} = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');
const { exec } = require('child_process');
const { File } = require('megajs');
const express = require('express');

// --- Local modules & configuration ---
// I've simplified the dependencies to core requirements.
// Ensure these files exist and are correctly structured.
const config = require('./config');
const { getBuffer, getGroupAdmins } = require('./lib/functions');
const { sms } = require('./lib'); // Main message object wrapper
const GroupEvents = require('./lib/groupevents');
const { AntiDelete } = require('./lib'); // Anti-delete handler
const events = require('./command'); // Your command files

// =================================================================
// ----------------- CONSTANTS & IN-MEMORY STORE -------------------
// =================================================================
// A store is critical for performance and features like anti-delete.
const store = makeInMemoryStore({ logger: P().child({ level: 'silent', stream: 'store' }) });
const prefix = config.PREFIX || '.';
const ownerNumbers = (config.OWNER_NUMBER || '').split(',').map(num => num.trim()).filter(num => num);

// =================================================================
// ----------------- TEMPORARY DIRECTORY MANAGEMENT ----------------
// =================================================================
const tempDir = path.join(os.tmpdir(), 'darkzone-temp-cache');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Clears the temp directory periodically to save space.
setInterval(() => {
    fs.readdir(tempDir, (err, files) => {
        if (err) return;
        for (const file of files) {
            try {
                fs.unlinkSync(path.join(tempDir, file));
            } catch (unlinkErr) {
                // Ignore if file is already gone
            }
        }
    });
}, 15 * 60 * 1000); // Every 15 minutes

// =================================================================
// ----------------- ASYNCHRONOUS SESSION HANDLING -----------------
// =================================================================
async function initializeSession() {
    const sessionDir = path.join(__dirname, 'sessions');
    const credsPath = path.join(sessionDir, 'creds.json');

    if (fs.existsSync(credsPath)) {
        console.log("✅ Session file found locally.");
        return;
    }

    console.log("🔍 No local session found.");
    if (!config.SESSION_ID) {
        console.error("❌ FATAL: SESSION_ID is not set in your config or environment variables!");
        console.error("Please obtain a session ID and add it to proceed.");
        process.exit(1); // Stop if no session ID is provided
    }

    console.log("⏳ Downloading session from provided ID...");
    // This regex cleans common prefixes from the session string
    const sessionKey = config.SESSION_ID.replace(/^(DARKZONE_MD|IK~|lol)/i, '').trim();

    try {
        if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);
        const filer = File.fromURL(`https://mega.nz/file/${sessionKey}`);
        const data = await filer.downloadBuffer();
        fs.writeFileSync(credsPath, data);
        console.log("✅ Session downloaded and saved successfully!");
    } catch (err) {
        console.error("❌ CRITICAL ERROR: Failed to download or save the session.", err.message);
        console.error("Please check if your SESSION_ID is correct and not expired.");
        process.exit(1); // Stop execution if the session is invalid
    }
}

// =================================================================
// ----------------- MAIN WHATSAPP CONNECTION LOGIC ----------------
// =================================================================
async function connectToWA() {
    // 1. Ensure the session is ready before connecting
    await initializeSession();

    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'));
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`🚀 Starting DARKZONE-MD on Baileys v${version.join('.')} (Latest: ${isLatest})`);

    const conn = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true, // Show QR in terminal for easy scanning
        browser: Browsers.macOS("Chrome"), // Set a realistic browser
        auth: state,
        syncFullHistory: false, // Syncing full history can be slow, disable for faster startup
        getMessage: async (key) => (store.loadMessage(key.remoteJid, key.id))?.message || undefined
    });

    // Bind the store to the connection events for contact/chat management
    store.bind(conn.ev);

    // --- Core Event Handlers ---
    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`🔌 Connection closed. Reason: ${DisconnectReason[lastDisconnect.error?.output?.statusCode] || 'Unknown'}. Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                // Use a small delay to avoid spamming connection requests
                setTimeout(connectToWA, 5000);
            } else {
                console.error("🚫 Connection logged out. You need to re-scan the QR code. Deleting session files...");
                fs.rmSync(path.join(__dirname, 'sessions'), { recursive: true, force: true });
                process.exit(1);
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp connection established!');
            const ownerJid = jidNormalizedUser(conn.user.id);
            const startupMessage = `*🤖 DARKZONE-MD Bot is now Online!*\n\n> *Status:* Operational\n> *Prefix:* ${prefix}`;
            conn.sendMessage(ownerJid, { text: startupMessage });
        }
    });

    // --- Message & Group Event Listeners ---
    // This is the main entry point for all incoming messages
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            // First, pass to AntiDelete handler
            await AntiDelete(conn, chatUpdate, store);
            // Then, process the message for commands and other features
            await messageHandler(conn, chatUpdate, store);
        } catch (e) {
            console.error(`❌ Error in messages.upsert handler:`, e);
        }
    });

    conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));

    return conn;
}


// =================================================================
// ----------------- EFFICIENT MESSAGE HANDLER ---------------------
// =================================================================
async function messageHandler(conn, chatUpdate, store) {
    const mek = chatUpdate.messages[0];
    // Ignore if no message content or if it's a status broadcast notification
    if (!mek.message || !mek.key.remoteJid) return;
    const from = mek.key.remoteJid;

    // --- **STATUS FEATURES HANDLER** ---
    // This block specifically handles all status-related actions for performance.
    if (from === 'status@broadcast') {
        if (config.AUTO_STATUS_SEEN === 'true') {
            await conn.readMessages([mek.key]);
        }
        // **FIXED & WORKING STATUS REACT:**
        if (config.AUTO_STATUS_REACT === 'true' && mek.key.participant) {
            const emojis = (config.AUTO_STATUS_REACT_EMOJIS || '❤️,🔥,💯,✅,😂,👍').split(',');
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            // The key is the only thing needed to react correctly.
            await conn.sendMessage(from, { react: { text: randomEmoji, key: mek.key } });
        }
        // **STATUS REPLY:**
        if (config.AUTO_STATUS_REPLY === 'true' && mek.key.participant) {
            await conn.sendMessage(mek.key.participant, 
                { text: config.AUTO_STATUS_MSG || "Nice status!" },
                { quoted: mek }
            );
        }
        return; // Stop further processing for status messages
    }
    
    // --- **REGULAR MESSAGE PROCESSING** ---
    // Use the custom 'sms' wrapper to simplify the message object
    const m = sms(conn, mek, store);
    if (!m.body || m.isBot) return; // Ignore empty messages and messages from the bot itself

    const { sender, isGroup, body } = m;
    const botNumber = jidNormalizedUser(conn.user.id);
    const isCmd = body.startsWith(prefix);

    // --- Permission & Mode Checks ---
    const sudoFilePath = path.join(__dirname, './lib/sudo.json');
    const sudoers = fs.existsSync(sudoFilePath) ? JSON.parse(fs.readFileSync(sudoFilePath)) : [];
    const isCreator = [botNumber.split('@')[0], ...ownerNumbers, ...sudoers].includes(sender.split('@')[0]);
    const isOwner = isCreator || m.isMe;

    const banFilePath = path.join(__dirname, './lib/ban.json');
    if (fs.existsSync(banFilePath)) {
        const bannedUsers = JSON.parse(fs.readFileSync(banFilePath));
        if (bannedUsers.includes(sender.split('@')[0])) return; // Ignore banned users
    }
    
    if (config.MODE === "private" && !isOwner) return;
    if (isGroup && config.MODE === "inbox" && !isOwner) return;
    if (!isGroup && config.MODE === "groups" && !isOwner) return;

    // --- AUTO REACT (for regular chats) ---
    if (config.AUTO_REACT === 'true' && !isCmd) {
        const reactions = (config.CUSTOM_REACT_EMOJIS || '❤️,🔥,👍').split(',');
        m.react(reactions[Math.floor(Math.random() * reactions.length)]);
    }

    // --- SHELL EXECUTOR (&) - OWNER ONLY ---
    // A safer implementation of the shell command executor.
    if (isOwner && body.startsWith("&")) {
        const commandToExec = body.slice(1).trim();
        if (!commandToExec) return m.reply("Please provide a shell command to execute.");
        
        m.reply(`Executing: \`${commandToExec}\`...`);
        exec(commandToExec, (error, stdout, stderr) => {
            if (error) return m.reply(`*EXEC ERROR:*\n${error.message}`);
            if (stderr) return m.reply(`*STDERR:*\n${stderr}`);
            return m.reply(`*STDOUT:*\n${stdout || "Command executed successfully with no output."}`);
        });
        return;
    }

    // --- **COMMAND PROCESSOR** ---
    // This is the most efficient way to handle commands.
    if (!isCmd) return;

    const command = body.slice(prefix.length).trim().split(' ').shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const text = args.join(' ');

    const cmd = events.commands.find((c) => c.pattern === command || (c.alias && c.alias.includes(command)));

    if (cmd) {
        // Run command guards
        const groupMetadata = isGroup ? await store.fetchGroupMetadata(from, conn) : {};
        const participants = groupMetadata.participants || [];
        const groupAdmins = isGroup ? getGroupAdmins(participants) : [];
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;

        if (cmd.isOwner && !isOwner) return m.reply("This command is for the bot owner only.");
        if (cmd.isGroup && !isGroup) return m.reply("This command can only be used in groups.");
        if (cmd.isAdmin && !isAdmins) return m.reply("This command is for group admins only.");
        if (cmd.isBotAdmin && !isBotAdmins) return m.reply("I must be an admin to execute this command.");

        try {
            if (cmd.react) m.react(cmd.react);
            await cmd.function(conn, m, {
                isCreator, isOwner, isGroup, isAdmins, isBotAdmins,
                command, text, args,
                groupMetadata, participants
            });
        } catch (e) {
            console.error(`❌ Error executing command '${command}':`, e);
            m.reply(`An error occurred while running the command: \n*${e.message}*`);
        }
    }
}


// =================================================================
// ----------------- SERVER & APP START ----------------------------
// =================================================================
const app = express();
const port = process.env.PORT || 9090;

app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f0f2f5;">
            <h1 style="color: #128C7E;">DARKZONE-MD Bot</h1>
            <p style="font-size: 1.2em; color: #333;">Server is running and listening.</p>
            <p style="color: #4CAF50; font-weight: bold;">Bot Status: ✅ Online</p>
            </div>`);
});

app.listen(port, () => console.log(`🌐 Server listening on http://localhost:${port}`));

// Launch the bot and handle any unexpected errors during startup
connectToWA().catch(err => console.error("❌ Unhandled fatal error during bot startup:", err));
