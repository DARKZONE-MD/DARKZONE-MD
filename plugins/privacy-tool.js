const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Enhanced Privacy Module with all working commands
module.exports = {
    name: "privacy",
    version: "3.0",
    author: "Your Name",
    description: "Complete privacy control system for WhatsApp bot",
    license: "MIT"
};

// Helper function to compress images
async function compressImage(buffer, quality = 80) {
    try {
        const sharp = require('sharp');
        return await sharp(buffer)
            .jpeg({ quality })
            .toBuffer();
    } catch (e) {
        console.error("Image compression error:", e);
        return buffer; // Return original if compression fails
    }
}

// Main privacy menu command
cmd({
    pattern: "privacy",
    alias: ["privacymenu", "privacyhelp"],
    desc: "Privacy settings menu with all options",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner }) => {
    try {
        const privacyMenu = `╭━━〔 *Privacy Control Center* 〕━━┈⊷
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
*Owner Only:* Most commands require owner privileges`;

        await conn.sendMessage(m.chat, { 
            text: privacyMenu,
            contextInfo: {
                externalAdReply: {
                    title: "Privacy Control Center",
                    body: "Manage your bot's privacy settings",
                    thumbnail: await conn.profilePictureUrl(conn.user.id, 'image').catch(() => '')
                }
            }
        }, { quoted: m });
    } catch (e) {
        console.error("Privacy menu error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Blocklist command with unblock functionality
cmd({
    pattern: "blocklist",
    alias: ["blocked", "listblocked"],
    desc: "View and manage blocked users",
    category: "privacy",
    react: "🚫",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, mentionByTag }) => {
    if (!isOwner) return reply("*🔒 Owner only command!*");

    try {
        const blockedUsers = await conn.fetchBlocklist();
        
        if (!blockedUsers || blockedUsers.length === 0) {
            return reply("📭 Your block list is currently empty.");
        }

        // If user tagged someone, unblock them
        if (mentionByTag && mentionByTag[0]) {
            const userToUnblock = mentionByTag[0];
            if (!blockedUsers.includes(userToUnblock)) {
                return reply(`❌ @${userToUnblock.split('@')[0]} is not blocked.`, 
                    { mentions: [userToUnblock] });
            }
            
            await conn.updateBlockStatus(userToUnblock, "unblock");
            return reply(`✅ Successfully unblocked @${userToUnblock.split('@')[0]}`, 
                { mentions: [userToUnblock] });
        }

        // Display block list
        const list = blockedUsers.map((user, i) => `${i+1}. @${user.split('@')[0]}`).join('\n');
        reply(`📋 *Blocked Users (${blockedUsers.length}):*\n\n${list}\n\nReply with *unblock @user* to unblock`, 
            { mentions: blockedUsers });
    } catch (err) {
        console.error("Blocklist error:", err);
        reply(`❌ Failed to fetch block list: ${err.message}`);
    }
});

// Dedicated unblock command
cmd({
    pattern: "unblock",
    desc: "Unblock a user",
    category: "privacy",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, mentionByTag }) => {
    if (!isOwner) return reply("*🔒 Owner only command!*");
    if (!mentionByTag || !mentionByTag[0]) return reply("❌ Please tag the user to unblock.");

    try {
        await conn.updateBlockStatus(mentionByTag[0], "unblock");
        reply(`✅ @${mentionByTag[0].split('@')[0]} has been unblocked`, 
            { mentions: [mentionByTag[0]] });
    } catch (err) {
        console.error("Unblock error:", err);
        reply(`❌ Failed to unblock: ${err.message}`);
    }
});

// Get user bio with enhanced features
cmd({
    pattern: "getbio",
    alias: ["fetchbio", "userbio"],
    desc: "Get any user's bio information",
    category: "privacy",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { reply, mentionByTag, args }) => {
    try {
        const jid = mentionByTag?.[0] || args[0] || m.sender;
        const about = await conn.fetchStatus(jid).catch(() => null);
        
        if (!about?.status) return reply("❌ No bio found or account is private.");

        const bioInfo = `📝 *Bio for @${jid.split('@')[0]}*\n\n` +
                        `${about.status}\n\n` +
                        `*Last Updated:* ${new Date(about.setAt).toLocaleString()}`;
        
        reply(bioInfo, { mentions: [jid] });
    } catch (error) {
        console.error("GetBio error:", error);
        reply("❌ Failed to fetch bio. The account may be private.");
    }
});

// Profile picture privacy control
cmd({
    pattern: "setppall",
    alias: ["ppprivacy"],
    desc: "Set who can see your profile picture",
    category: "privacy",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply("❌ Owner only command!");
    
    const options = {
        'all': 'Everyone',
        'contacts': 'My contacts only',
        'contact_blacklist': 'Contacts except blocked',
        'none': 'Nobody'
    };
    
    const value = args[0]?.toLowerCase();
    
    if (!value || !options[value]) {
        return reply(`❌ Invalid option. Available:\n\n${
            Object.entries(options).map(([key, desc]) => `• ${key} - ${desc}`).join('\n')
        }`);
    }
    
    try {
        await conn.updateProfilePicturePrivacy(value);
        reply(`✅ Profile picture privacy set to: *${options[value]}*`);
    } catch (e) {
        console.error("SetPPAll error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

// Online status privacy
cmd({
    pattern: "setonline",
    alias: ["onlineprivacy"],
    desc: "Control your online status visibility",
    category: "privacy",
    react: "🟢",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const options = {
        'all': 'Everyone can see',
        'match_last_seen': 'Match last seen privacy'
    };
    
    const value = args[0]?.toLowerCase();
    
    if (!value || !options[value]) {
        return reply(`❌ Invalid option. Available:\n\n${
            Object.entries(options).map(([key, desc]) => `• ${key} - ${desc}`).join('\n')
        }`);
    }

    try {
        await conn.updateOnlinePrivacy(value);
        reply(`✅ Online privacy set to: *${options[value]}*`);
    } catch (e) {
        console.error("SetOnline error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

// Set profile picture with quality options
cmd({
    pattern: "setpp",
    alias: ["setprofilepic"],
    desc: "Change bot's profile picture with quality options",
    category: "privacy",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, quoted }) => {
    if (!isOwner) return reply("❌ Owner only command!");
    if (!quoted?.message?.imageMessage) {
        return reply("❌ Please reply to an image with caption:\n`setpp [quality: low/medium/high]`");
    }

    try {
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
        if (quality !== 'high') {
            const qualityValue = quality === 'low' ? 50 : 75;
            finalBuffer = await compressImage(buffer, qualityValue);
        }

        await conn.updateProfilePicture(conn.user.id, finalBuffer);
        reply(`✅ Profile picture updated (${quality} quality)!`);
    } catch (error) {
        console.error("SetPP error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});

// Set bot's display name
cmd({
    pattern: "setmyname",
    alias: ["setname", "changename"],
    desc: "Change bot's display name",
    category: "privacy",
    react: "🏷️",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
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

// Update bot's bio
cmd({
    pattern: "updatebio",
    alias: ["setbio", "changebio"],
    desc: "Change bot's bio information",
    category: "privacy",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
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

// Group add privacy settings
cmd({
    pattern: "groupsprivacy",
    alias: ["groupprivacy"],
    desc: "Control who can add you to groups",
    category: "privacy",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const options = {
        'all': 'Everyone can add',
        'contacts': 'My contacts only',
        'contact_blacklist': 'Contacts except blocked',
        'none': 'Nobody can add'
    };
    
    const value = args[0]?.toLowerCase();
    
    if (!value || !options[value]) {
        return reply(`❌ Invalid option. Available:\n\n${
            Object.entries(options).map(([key, desc]) => `• ${key} - ${desc}`).join('\n')
        }`);
    }

    try {
        await conn.updateGroupsAddPrivacy(value);
        reply(`✅ Group add privacy set to: *${options[value]}*`);
    } catch (e) {
        console.error("GroupsPrivacy error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

// View current privacy settings
cmd({
    pattern: "getprivacy",
    alias: ["privacyinfo"],
    desc: "View all current privacy settings",
    category: "privacy",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner }) => {
    if (!isOwner) return reply('🚫 Owner only command!');
    
    try {
        const settings = await conn.fetchPrivacySettings(true);
        if (!settings) return reply('❌ Failed to fetch privacy settings.');
        
        const format = (val) => {
            const map = {
                'all': 'Everyone',
                'contacts': 'Contacts',
                'contact_blacklist': 'Contacts (excl. blocked)',
                'none': 'Nobody',
                'match_last_seen': 'Match Last Seen'
            };
            return map[val] || val;
        };

        const info = `
╭───「 *Current Privacy Settings* 」───◆
│ 📷 Profile Picture: ${format(settings.profile)}
│ 🕒 Last Seen: ${format(settings.last)}
│ 🟢 Online Status: ${format(settings.online)}
│ 👥 Group Adds: ${format(settings.groupadd)}
│ 📞 Calls: ${format(settings.calladd)}
│ 📝 Status Updates: ${format(settings.status)}
│ ✅ Read Receipts: ${format(settings.readreceipts)}
╰─────────────────────`;

        reply(info);
    } catch (e) {
        console.error("GetPrivacy error:", e);
        reply('❌ Failed to fetch privacy settings.');
    }
});

// Get user's profile picture
cmd({
    pattern: "getpp",
    alias: ["getprofilepic", "getpic"],
    desc: "Get any user's profile picture",
    category: "privacy",
    react: "📸",
    filename: __filename
}, async (conn, mek, m, { reply, mentionByTag, quoted }) => {
    try {
        const targetJid = mentionByTag?.[0] || quoted?.sender || m.sender;
        if (!targetJid) return reply("❌ Please tag or reply to a user.");

        const isHD = m.text.includes("hd") || m.text.includes("high");
        const picUrl = await conn.profilePictureUrl(targetJid, 'image', isHD ? "hd" : "preview")
            .catch(() => null);
        
        if (!picUrl) return reply("❌ No profile picture found or account is private.");

        await conn.sendMessage(m.chat, {
            image: { url: picUrl },
            caption: `📸 Profile picture of @${targetJid.split('@')[0]}${isHD ? " (HD)" : ""}`,
            mentions: [targetJid]
        }, { quoted: m });
    } catch (e) {
        console.error("GetPP error:", e);
        reply("❌ Failed to fetch profile picture. The account may be private.");
    }
});

// Last seen privacy control
cmd({
    pattern: "lastseen",
    alias: ["lastseenprivacy"],
    desc: "Set your last seen privacy",
    category: "privacy",
    react: "🕒",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const options = {
        'all': 'Everyone can see',
        'contacts': 'Contacts only',
        'contact_blacklist': 'Contacts (excl. blocked)',
        'none': 'Nobody can see'
    };
    
    const value = args[0]?.toLowerCase();
    
    if (!value || !options[value]) {
        return reply(`❌ Invalid option. Available:\n\n${
            Object.entries(options).map(([key, desc]) => `• ${key} - ${desc}`).join('\n')
        }`);
    }

    try {
        await conn.updateLastSeenPrivacy(value);
        reply(`✅ Last seen privacy set to: *${options[value]}*`);
    } catch (e) {
        console.error("LastSeen error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

// Status privacy control
cmd({
    pattern: "statusprivacy",
    alias: ["statusvisibility"],
    desc: "Set who can see your status updates",
    category: "privacy",
    react: "📢",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const options = {
        'all': 'Everyone can see',
        'contacts': 'Contacts only',
        'contact_blacklist': 'Contacts (excl. blocked)',
        'none': 'Nobody can see'
    };
    
    const value = args[0]?.toLowerCase();
    
    if (!value || !options[value]) {
        return reply(`❌ Invalid option. Available:\n\n${
            Object.entries(options).map(([key, desc]) => `• ${key} - ${desc}`).join('\n')
        }`);
    }

    try {
        await conn.updateStatusPrivacy(value);
        reply(`✅ Status privacy set to: *${options[value]}*`);
    } catch (e) {
        console.error("StatusPrivacy error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});
