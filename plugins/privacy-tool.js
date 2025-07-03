const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: "privacy",
    version: "2.0",
    author: "Your Name",
    description: "Complete privacy control system for WhatsApp bot",
    license: "MIT"
};

cmd({
    pattern: "privacy",
    alias: ["privacymenu"],
    desc: "Privacy settings menu",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner }) => {
    try {
        const privacyMenu = `╭━━〔 *Privacy Settings* 〕━━┈⊷
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

        await conn.sendMessage(m.chat, {
            text: privacyMenu,
            contextInfo: {
                externalAdReply: {
                    title: "Privacy Settings Menu",
                    body: "Control your bot's privacy",
                    thumbnail: await conn.getProfilePicture(conn.user.jid).catch(() => '')
                }
            }
        }, { quoted: m });
    } catch (e) {
        console.error("Privacy menu error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

cmd({
    pattern: "blocklist",
    desc: "View blocked users",
    category: "privacy",
    react: "🚫",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner }) => {
    if (!isOwner) return reply("*📛 Owner only command!*");

    try {
        const blockedUsers = await conn.fetchBlocklist();
        if (!blockedUsers || blockedUsers.length === 0) {
            return reply("📋 Your block list is empty.");
        }

        const list = blockedUsers.map((user, i) => `${i+1}. @${user.split('@')[0]}`).join('\n');
        reply(`📋 *Blocked Users (${blockedUsers.length}):*\n\n${list}`, 
            { mentions: blockedUsers });
    } catch (err) {
        console.error("Blocklist error:", err);
        reply(`❌ Failed to fetch block list: ${err.message}`);
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblock a user",
    category: "privacy",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, mentionByTag }) => {
    if (!isOwner) return reply("*📛 Owner only command!*");
    if (!mentionByTag || !mentionByTag[0]) return reply("❌ Please tag the user to unblock.");

    try {
        await conn.updateBlockStatus(mentionByTag[0], "unblock");
        reply(`✅ Unblocked @${mentionByTag[0].split('@')[0]}`, 
            { mentions: [mentionByTag[0]] });
    } catch (err) {
        console.error("Unblock error:", err);
        reply(`❌ Failed to unblock: ${err.message}`);
    }
});

cmd({
    pattern: "getbio",
    desc: "Get user's bio",
    category: "privacy",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { reply, mentionByTag, args }) => {
    try {
        const jid = mentionByTag?.[0] || args[0] || m.sender;
        const about = await conn.fetchStatus(jid);
        
        if (!about?.status) return reply("❌ No bio found for this user.");
        
        reply(`📝 *Bio for @${jid.split('@')[0]}*\n\n${about.status}`, 
            { mentions: [jid] });
    } catch (error) {
        console.error("GetBio error:", error);
        reply("❌ Failed to fetch bio. The account may be private.");
    }
});

cmd({
    pattern: "setppall",
    desc: "Set profile picture privacy",
    category: "privacy",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply("❌ Owner only command!");
    
    const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
    const value = args[0]?.toLowerCase();
    
    if (!value || !validValues.includes(value)) {
        return reply(`❌ Invalid option. Use: ${validValues.join(', ')}`);
    }
    
    try {
        await conn.updateProfilePicturePrivacy(value);
        reply(`✅ Profile picture privacy set to: ${value}`);
    } catch (e) {
        console.error("SetPPAll error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

cmd({
    pattern: "setonline",
    desc: "Set online privacy",
    category: "privacy",
    react: "🟢",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const validValues = ['all', 'match_last_seen'];
    const value = args[0]?.toLowerCase();
    
    if (!value || !validValues.includes(value)) {
        return reply(`❌ Invalid option. Use: ${validValues.join(', ')}`);
    }

    try {
        await conn.updateOnlinePrivacy(value);
        reply(`✅ Online privacy set to: ${value}`);
    } catch (e) {
        console.error("SetOnline error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

cmd({
    pattern: "setpp",
    desc: "Set bot's profile picture",
    category: "privacy",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, quoted }) => {
    if (!isOwner) return reply("❌ Owner only command!");
    if (!quoted?.message?.imageMessage) return reply("❌ Please reply to an image.");

    try {
        const stream = await downloadContentFromMessage(quoted.message.imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        await conn.updateProfilePicture(conn.user.jid, buffer);
        reply("✅ Profile picture updated successfully!");
    } catch (error) {
        console.error("SetPP error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});

cmd({
    pattern: "setmyname",
    desc: "Change bot's name",
    category: "privacy",
    react: "🏷️",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const displayName = args.join(" ");
    if (!displayName) return reply("❌ Please provide a name.");

    try {
        await conn.updateProfileName(displayName);
        reply(`✅ Name changed to: ${displayName}`);
    } catch (err) {
        console.error("SetName error:", err);
        reply("❌ Failed to update name.");
    }
});

cmd({
    pattern: "updatebio",
    desc: "Change bot's bio",
    category: "privacy",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply('🚫 Owner only command!');
    
    const newBio = args.join(" ");
    if (!newBio) return reply('❌ Please provide a bio.');
    
    try {
        await conn.updateProfileStatus(newBio);
        reply(`✅ Bio updated:\n\n${newBio}`);
    } catch (e) {
        console.error("UpdateBio error:", e);
        reply('❌ Failed to update bio.');
    }
});

cmd({
    pattern: "groupsprivacy",
    desc: "Set group add privacy",
    category: "privacy",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
    const value = args[0]?.toLowerCase();
    
    if (!value || !validValues.includes(value)) {
        return reply(`❌ Invalid option. Use: ${validValues.join(', ')}`);
    }

    try {
        await conn.updateGroupsAddPrivacy(value);
        reply(`✅ Group add privacy set to: ${value}`);
    } catch (e) {
        console.error("GroupsPrivacy error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});

cmd({
    pattern: "getprivacy",
    desc: "View privacy settings",
    category: "privacy",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner }) => {
    if (!isOwner) return reply('🚫 Owner only command!');
    
    try {
        const settings = await conn.fetchPrivacySettings(true);
        if (!settings) return reply('❌ Failed to fetch settings.');
        
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
╭───「 *PRIVACY SETTINGS* 」───◆
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
        reply('❌ Failed to fetch settings.');
    }
});

cmd({
    pattern: "getpp",
    desc: "Get user's profile picture",
    category: "privacy",
    react: "📸",
    filename: __filename
}, async (conn, mek, m, { reply, mentionByTag, quoted }) => {
    try {
        const targetJid = mentionByTag?.[0] || quoted?.sender || m.sender;
        if (!targetJid) return reply("❌ Please tag or reply to a user.");

        const picUrl = await conn.profilePictureUrl(targetJid, 'image').catch(() => null);
        if (!picUrl) return reply("❌ No profile picture found.");

        await conn.sendMessage(m.chat, {
            image: { url: picUrl },
            caption: `📸 Profile picture of @${targetJid.split('@')[0]}`,
            mentions: [targetJid]
        }, { quoted: m });
    } catch (e) {
        console.error("GetPP error:", e);
        reply("❌ Failed to fetch profile picture.");
    }
});

cmd({
    pattern: "lastseen",
    desc: "Set last seen privacy",
    category: "privacy",
    react: "🕒",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, args }) => {
    if (!isOwner) return reply("❌ Owner only command!");

    const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
    const value = args[0]?.toLowerCase();
    
    if (!value || !validValues.includes(value)) {
        return reply(`❌ Invalid option. Use: ${validValues.join(', ')}`);
    }

    try {
        await conn.updateLastSeenPrivacy(value);
        reply(`✅ Last seen privacy set to: ${value}`);
    } catch (e) {
        console.error("LastSeen error:", e);
        reply(`❌ Failed to update: ${e.message}`);
    }
});
