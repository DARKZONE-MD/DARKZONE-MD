const fs = require("fs");
const config = require("../config");
const { cmd, commands } = require("../command");
const path = require('path');
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// Enhanced Privacy Module
module.exports = {
    name: "privacy",
    version: "2.0",
    author: "Your Name",
    description: "Advanced privacy control system for WhatsApp bot",
    license: "MIT",
    cooldown: 5
};

cmd({
    pattern: "privacy",
    alias: ["privacymenu", "privacyhelp"],
    desc: "Privacy settings menu with enhanced options",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let privacyMenu = `╭━━〔 *Privacy Settings* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• blocklist - View blocked users
┃◈┃• unblock @user - Unblock a user
┃◈┃• getbio @user - Get user's bio
┃◈┃• setppall [option] - Set profile pic privacy
┃◈┃• setonline [option] - Set online privacy
┃◈┃• setpp [reply image] - Change bot's profile pic
┃◈┃• setmyname [text] - Change bot's name
┃◈┃• updatebio [text] - Change bot's bio
┃◈┃• groupsprivacy [option] - Set group add privacy
┃◈┃• getprivacy - View current privacy settings
┃◈┃• getpp @user - Get user's profile picture
┃◈┃• lastseen [option] - Set last seen privacy
┃◈┃• statusprivacy [option] - Set status privacy
┃◈┃
┃◈┃*Privacy Options:*
┃◈┃• all - Everyone
┃◈┃• contacts - My contacts only
┃◈┃• contact_blacklist - Contacts except blocked
┃◈┃• none - Nobody
┃◈┃• match_last_seen - Match last seen
┃◈└───────────┈⊷
╰──────────────┈⊷
*Note:* Most commands are owner-only`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://i.imgur.com/7D0dQrX.png` }, // Privacy-themed image
                caption: privacyMenu,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error("Privacy menu error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Enhanced Blocklist Command
cmd({
    pattern: "blocklist",
    alias: ["blockedlist"],
    desc: "View and manage blocked users",
    category: "privacy",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, mentionByTag }) => {
    if (!isOwner) return reply("*📛 Owner only command!*");

    try {
        const blockedUsers = await conn.fetchBlocklist();
        
        if (blockedUsers.length === 0) {
            return reply("📋 Your block list is empty.");
        }

        // New: Check if user wants to unblock someone
        if (mentionByTag && mentionByTag[0]) {
            const userToUnblock = mentionByTag[0];
            if (!blockedUsers.includes(userToUnblock)) {
                return reply("❌ This user is not blocked.");
            }
            
            await conn.updateBlockStatus(userToUnblock, "unblock");
            return reply(`✅ Unblocked ${userToUnblock.split('@')[0]}`);
        }

        // Format blocked users list
        const list = blockedUsers
            .map((user, i) => `${i+1}. @${user.split('@')[0]}`)
            .join('\n');

        const count = blockedUsers.length;
        reply(`📋 *Blocked Users (${count}):*\n\n${list}\n\nTo unblock: reply *unblock @user* or tag with this command`, 
            { mentions: blockedUsers });
    } catch (err) {
        console.error("Blocklist error:", err);
        reply(`❌ Failed to fetch block list: ${err.message}`);
    }
});

// New Unblock Command
cmd({
    pattern: "unblock",
    desc: "Unblock a user",
    category: "privacy",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { isOwner, reply, mentionByTag }) => {
    if (!isOwner) return reply("*📛 Owner only command!*");
    if (!mentionByTag || !mentionByTag[0]) return reply("❌ Please tag the user to unblock.");

    try {
        const userToUnblock = mentionByTag[0];
        await conn.updateBlockStatus(userToUnblock, "unblock");
        reply(`✅ Successfully unblocked @${userToUnblock.split('@')[0]}`, 
            { mentions: [userToUnblock] });
    } catch (err) {
        console.error("Unblock error:", err);
        reply(`❌ Failed to unblock: ${err.message}`);
    }
});

// Enhanced GetBio Command
cmd({
    pattern: "getbio",
    alias: ["fetchbio"],
    desc: "Get user's bio with more details",
    category: "privacy",
    react: "📝",
    filename: __filename,
}, async (conn, mek, m, { args, reply, mentionByTag }) => {
    try {
        const jid = mentionByTag?.[0] || args[0] || mek.key.remoteJid;
        const about = await conn.fetchStatus(jid);
        
        if (!about || !about.status) return reply("❌ No bio found for this user.");
        
        const formattedBio = `*📝 Bio for @${jid.split('@')[0]}*\n\n` +
                            `${about.status}\n\n` +
                            `*Last Updated:* ${new Date(about.setAt).toLocaleString()}`;
        
        reply(formattedBio, { mentions: [jid] });
    } catch (error) {
        console.error("GetBio error:", error);
        reply("❌ Failed to fetch bio. The account may be private.");
    }
});

// Enhanced Set Profile Picture Privacy
cmd({
    pattern: "setppall",
    alias: ["ppprivacy"],
    desc: "Set profile picture privacy with more options",
    category: "privacy",
    react: "🖼️",
    filename: __filename
}, 
async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("❌ Owner only command!");
    
    const validValues = {
        'all': 'Everyone',
        'contacts': 'My contacts only',
        'contact_blacklist': 'Contacts except blocked',
        'none': 'Nobody'
    };
    
    const value = args[0]?.toLowerCase();
    
    if (!value || !validValues[value]) {
        return reply(`❌ Invalid option. Available options:\n\n` +
                     Object.entries(validValues)
                        .map(([key, desc]) => `• ${key} - ${desc}`)
                        .join('\n'));
    }
    
    try {
        await conn.updateProfilePicturePrivacy(value);
        reply(`✅ Profile picture privacy set to: *${validValues[value]}*`);
    } catch (e) {
        console.error("SetPPAll error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

// Enhanced Online Privacy Command
cmd({
    pattern: "setonline",
    alias: ["onlineprivacy"],
    desc: "Set online status privacy",
    category: "privacy",
    react: "🟢",
    filename: __filename
}, 
async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const validValues = {
        'all': 'Everyone can see',
        'match_last_seen': 'Match last seen privacy'
    };
    
    const value = args[0]?.toLowerCase();
    
    if (!value || !validValues[value]) {
        return reply(`❌ Invalid option. Available options:\n\n` +
                     Object.entries(validValues)
                        .map(([key, desc]) => `• ${key} - ${desc}`)
                        .join('\n'));
    }

    try {
        await conn.updateOnlinePrivacy(value);
        reply(`✅ Online privacy set to: *${validValues[value]}*`);
    } catch (e) {
        console.error("SetOnline error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

// Enhanced Set Profile Picture Command
cmd({
    pattern: "setpp",
    alias: ["setprofilepic"],
    desc: "Set bot's profile picture with quality options",
    category: "privacy",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ Owner only command!");
    
    if (!quoted?.message?.imageMessage) {
        return reply("❌ Please reply to an image with caption:\n`setpp [quality: low/medium/high]`");
    }

    try {
        // Get quality option (default: medium)
        const quality = m.text.split(' ')[1]?.toLowerCase() || 'medium';
        const validQualities = ['low', 'medium', 'high'];
        
        if (!validQualities.includes(quality)) {
            return reply(`❌ Invalid quality. Use: ${validQualities.join(', ')}`);
        }

        const stream = await downloadContentFromMessage(quoted.message.imageMessage, 'image');
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Apply quality settings
        let finalBuffer = buffer;
        if (quality === 'low') {
            finalBuffer = await compressImage(buffer, 50);
        } else if (quality === 'medium') {
            finalBuffer = await compressImage(buffer, 75);
        }
        // high quality uses original buffer

        await conn.updateProfilePicture(conn.user.id, finalBuffer);
        reply(`✅ Profile picture updated (${quality} quality)!`);
    } catch (error) {
        console.error("SetPP error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});

// Helper function to compress images
async function compressImage(buffer, quality) {
    const sharp = require('sharp');
    return await sharp(buffer)
        .jpeg({ quality })
        .toBuffer();
}

// Enhanced Set Name Command
cmd({
    pattern: "setmyname",
    alias: ["setname", "changename"],
    desc: "Change bot's display name with character limit check",
    category: "privacy",
    react: "🏷️",
    filename: __filename
},
async (conn, mek, m, { isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const displayName = args.join(" ");
    if (!displayName) return reply("❌ Please provide a name. Example:\n`setmyname My Cool Bot`");

    if (displayName.length > 25) {
        return reply("❌ Name too long! Maximum 25 characters.");
    }

    try {
        await conn.updateProfileName(displayName);
        reply(`✅ Name changed to: *${displayName}*`);
    } catch (err) {
        console.error("SetName error:", err);
        reply("❌ Failed to update name. Try again later.");
    }
});

// Enhanced Bio Command
cmd({
    pattern: "updatebio",
    alias: ["setbio", "changebio"],
    desc: "Change bot's bio with character limit and emoji support",
    category: "privacy",
    react: "📝",
    filename: __filename
},
async (conn, mek, m, { isOwner, args, reply }) => {
    if (!isOwner) return reply('🚫 Owner only command!');
    
    const newBio = args.join(" ");
    if (!newBio) return reply('❌ Please provide a bio. Example:\n`updatebio I am a cool bot 🤖`');
    
    if (newBio.length > 139) {
        return reply(`❌ Bio too long! ${newBio.length}/139 characters.`);
    }

    try {
        await conn.updateProfileStatus(newBio);
        reply(`✅ Bio updated:\n\n${newBio}`);
    } catch (e) {
        console.error("UpdateBio error:", e);
        reply('❌ Failed to update bio. Try again later.');
    }
});

// Enhanced Groups Privacy Command
cmd({
    pattern: "groupsprivacy",
    alias: ["groupprivacy"],
    desc: "Control who can add you to groups",
    category: "privacy",
    react: "👥",
    filename: __filename
}, 
async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const validValues = {
        'all': 'Everyone can add',
        'contacts': 'My contacts only',
        'contact_blacklist': 'Contacts except blocked',
        'none': 'Nobody can add'
    };
    
    const value = args[0]?.toLowerCase();
    
    if (!value || !validValues[value]) {
        return reply(`❌ Invalid option. Available options:\n\n` +
                     Object.entries(validValues)
                        .map(([key, desc]) => `• ${key} - ${desc}`)
                        .join('\n'));
    }

    try {
        await conn.updateGroupsAddPrivacy(value);
        reply(`✅ Group add privacy set to: *${validValues[value]}*`);
    } catch (e) {
        console.error("GroupsPrivacy error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

// Enhanced Get Privacy Settings Command
cmd({
    pattern: "getprivacy",
    alias: ["privacyinfo"],
    desc: "View all current privacy settings",
    category: "privacy",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply('🚫 Owner only command!');
    
    try {
        const privacySettings = await conn.fetchPrivacySettings(true);
        if (!privacySettings) return reply('❌ Failed to fetch privacy settings');
        
        const formatSetting = (value) => {
            const mappings = {
                'all': 'Everyone',
                'contacts': 'Contacts',
                'contact_blacklist': 'Contacts (excl. blocked)',
                'none': 'Nobody',
                'match_last_seen': 'Match Last Seen'
            };
            return mappings[value] || value;
        };

        const privacyInfo = `
╭───「 *PRIVACY SETTINGS* 」───◆
│ 📷 *Profile Picture:* ${formatSetting(privacySettings.profile)}
│ 🕒 *Last Seen:* ${formatSetting(privacySettings.last)}
│ 🟢 *Online Status:* ${formatSetting(privacySettings.online)}
│ 👥 *Group Adds:* ${formatSetting(privacySettings.groupadd)}
│ 📞 *Calls:* ${formatSetting(privacySettings.calladd)}
│ 📝 *Status Updates:* ${formatSetting(privacySettings.status)}
│ ✅ *Read Receipts:* ${formatSetting(privacySettings.readreceipts)}
╰─────────────────────`;

        await reply(privacyInfo);
    } catch (e) {
        console.error("GetPrivacy error:", e);
        reply('❌ Failed to fetch privacy settings. Try again later.');
    }
});

// Enhanced Get Profile Picture Command
cmd({
    pattern: "getpp",
    alias: ["getprofilepic"],
    desc: "Get user's profile picture with HD option",
    category: "privacy",
    react: "📸",
    filename: __filename
}, async (conn, mek, m, { quoted, reply, mentionByTag }) => {
    try {
        const targetJid = mentionByTag?.[0] || quoted?.sender || m.sender;
        if (!targetJid) return reply("❌ Please tag a user or reply to their message.");

        const isHD = m.text.includes("hd") || m.text.includes("high");
        const profilePicUrl = await conn.profilePictureUrl(targetJid, "image", isHD ? "hd" : "preview");
        
        if (!profilePicUrl) return reply("❌ This user has no profile picture or it's private.");

        const username = targetJid.split('@')[0];
        await conn.sendMessage(m.chat, {
            image: { url: profilePicUrl },
            caption: `📸 Profile picture of @${username}${isHD ? " (HD)" : ""}`,
            mentions: [targetJid]
        }, { quoted: m });
    } catch (e) {
        console.error("GetPP error:", e);
        reply("❌ Failed to fetch profile picture. The account may be private.");
    }
});

// New Last Seen Privacy Command
cmd({
    pattern: "lastseen",
    alias: ["lastseenprivacy"],
    desc: "Set last seen privacy",
    category: "privacy",
    react: "🕒",
    filename: __filename
}, 
async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const validValues = {
        'all': 'Everyone can see',
        'contacts': 'Contacts only',
        'contact_blacklist': 'Contacts (excl. blocked)',
        'none': 'Nobody can see'
    };
    
    const value = args[0]?.toLowerCase();
    
    if (!value || !validValues[value]) {
        return reply(`❌ Invalid option. Available options:\n\n` +
                     Object.entries(validValues)
                        .map(([key, desc]) => `• ${key} - ${desc}`)
                        .join('\n'));
    }

    try {
        await conn.updateLastSeenPrivacy(value);
        reply(`✅ Last seen privacy set to: *${validValues[value]}*`);
    } catch (e) {
        console.error("LastSeen error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

// New Status Privacy Command
cmd({
    pattern: "statusprivacy",
    alias: ["statusvisibility"],
    desc: "Set who can see your status updates",
    category: "privacy",
    react: "📢",
    filename: __filename
}, 
async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const validValues = {
        'all': 'Everyone can see',
        'contacts': 'Contacts only',
        'contact_blacklist': 'Contacts (excl. blocked)',
        'none': 'Nobody can see'
    };
    
    const value = args[0]?.toLowerCase();
    
    if (!value || !validValues[value]) {
        return reply(`❌ Invalid option. Available options:\n\n` +
                     Object.entries(validValues)
                        .map(([key, desc]) => `• ${key} - ${desc}`)
                        .join('\n'));
    }

    try {
        await conn.updateStatusPrivacy(value);
        reply(`✅ Status privacy set to: *${validValues[value]}*`);
    } catch (e) {
        console.error("StatusPrivacy error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});
