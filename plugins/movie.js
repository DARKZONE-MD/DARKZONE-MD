const { fetchJson } = require("../lib/functions");
const axios = require("axios");
const { cmd, commands } = require('../command');

// Movie Download Command
cmd({
  pattern: "movie",
  desc: "Download movies.",
  react: "🍿",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) {
      return reply("❌ Please provide a movie name or keyword.");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `https://movie-database-api1.p.rapidapi.com/list_movies.json?limit=20&page=1&quality=all&genre=all&minimum_rating=0&query_term=${q}&sort_by=date_added&order_by=desc&with_rt_ratings=false`;
    const headers = {
      'x-rapidapi-host': 'movie-database-api1.p.rapidapi.com',
      'x-rapidapi-key': '8f8214432dmshe2d6730ba6b5541p119a35jsna12406472100'
    };

    const response = await axios.get(apiUrl, { headers });
    const data = response.data;

    if (!data || !data.data || !data.data.movies) {
      return reply("⚠️ No movies found. Please try again with a different keyword.");
    }

    const movies = data.data.movies;
    const movieList = movies.map((movie, index) => `${index + 1}. ${movie.title} (${movie.year})`).join('\n');

    const caption = `╭━━━〔 *MOVIE DOWNLOADER* 〕━━━⊷\n`
      + `┃▸ *Search Results:*\n`
      + `${movieList}\n`
      + `╰━━━⪼\n\n`
      + `📌 *Reply with the number to download your chosen movie.*`;

    const sentMsg = await conn.sendMessage(from, { text: caption }, { quoted: m });
    const messageID = sentMsg.key.id;

    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        const selectedIndex = parseInt(receivedText) - 1;
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= movies.length) {
          return reply("❌ Invalid selection. Please try again.");
        }

        const selectedMovie = movies[selectedIndex];
        // TO DO: implement movie download logic here
        // For now, just send the movie title as a reply
        await conn.sendMessage(senderID, { text: `You selected: ${selectedMovie.title}` }, { quoted: receivedMsg });
      }
    });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});

// ... (rest of your existing code remains the same)
