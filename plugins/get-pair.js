const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get pairing code for DARKZONE-MD bot",
    category: "download",
    use: ".pair 92336137XXX",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        // Extract and validate phone number
        let phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');
        
        // Add country code if missing
        if (!phoneNumber.startsWith('92') && phoneNumber.length === 10) {
            phoneNumber = '92' + phoneNumber;
        }

        // Validate phone number
        if (!phoneNumber.match(/^92\d{9,12}$/)) {
            return await reply("❌ Invalid Pakistan number!\nUse: `.pair 92306123XXXX`");
        }

        // API Request with timeout
        const { data } = await axios.get(`https://irfan-7hee.onrender.com/code?number=${phoneNumber}`, {
            timeout: 10000 // 10 seconds timeout
        });

        if (!data?.code) {
            return await reply("⚠️ Pairing server busy. Try again later!");
        }

        // Send formatted response
        await reply(`*DARKZONE-MD PAIRING CODE* 🚀\n\n` +
                   `▢ *Number:* ${phoneNumber}\n` +
                   `▢ *Code:* ${data.code}\n\n` +
                   `_Expires in 5 minutes_`);

        // Send raw code separately
        await reply(data.code.toString());

    } catch (error) {
        console.error("Pair Error:", error);
        if (error.code === 'ECONNABORTED') {
            await reply("❌ Server timeout! Try again in 1 minute.");
        } else {
            await reply("⚠️ Pairing service unavailable. Contact @Owner");
        }
    }
});
