const { cmd } = require("../command");
const { sleep } = require("../lib/functions");
const { exec } = require("child_process");

cmd({
  pattern: "restart",
  desc: "Restart DARKZONE-MD",
  category: "owner",
  filename: __filename
},
async (conn, mek, m, { reply, isCreator }) => {
  try {
    if (!isCreator) {
      return await reply("❌ Only the bot owner can use this command.");
    }

    await reply("♻️ Restarting DARKZONE-MD, please wait...");
    await sleep(1000); // optional pause for effect

    exec("pm2 restart all", (error, stdout, stderr) => {
      if (error) {
        console.error("Restart error:", error);
        return conn.sendMessage(mek.chat, { text: `❌ Restart failed:\n${error.message}` }, { quoted: mek });
      }
      conn.sendMessage(mek.chat, { text: "✅ Successfully restarted DARKZONE-MD." }, { quoted: mek });
    });

  } catch (err) {
    console.error("Restart Command Error:", err);
    await reply("⚠️ Something went wrong:\n" + err.message);
  }
});
                  
