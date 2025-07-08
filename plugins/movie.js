const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "movie",
    desc: "Download or get details about the latest movies.",
    category: "utility",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, args }) => {
    try {
        const movieName = args.length > 0 ? args.join(' ') : null;

        let apiUrl;
        if (movieName) {
            // Search by movie name
            apiUrl = `https://movie-database-api1.p.rapidapi.com/list_movies.json?query_term=${encodeURIComponent(movieName)}&limit=5`;
        } else {
            // Fetch latest added movies
            apiUrl = `https://movie-database-api1.p.rapidapi.com/list_movies.json?limit=5&page=1&sort_by=date_added&order_by=desc`;
        }

        const response = await axios.get(apiUrl, {
            headers: {
                'x-rapidapi-host': 'movie-database-api1.p.rapidapi.com',
                'x-rapidapi-key': '8f8214432dmshe2d6730ba6b5541p119a35jsna12406472100'
            }
        });

        const movies = response.data?.data?.movies;

        if (!movies || movies.length === 0) {
            return reply("❌ No movies found. Try a different name or check later.");
        }

        for (const movie of movies) {
            let torrentList = movie.torrents?.map(t => `📥 *${t.quality.toUpperCase()} ${t.type.toUpperCase()}* - [Download](${t.url})`).join('\n') || 'No torrents available';

            let caption = `
🎬 *${movie.title_long}*
⭐ *Rating:* ${movie.rating}/10
🎭 *Genres:* ${movie.genres.join(', ')}
📅 *Year:* ${movie.year}
🕒 *Duration:* ${movie.runtime} min
🌐 *Language:* ${movie.language.toUpperCase()}

📝 *Summary:*
${movie.summary || 'N/A'}

${torrentList}
            `.trim();

            await conn.sendMessage(from, {
                image: {
                    url: movie.medium_cover_image || movie.large_cover_image || 'https://files.catbox.moe/7zfdcq.jpg'
                },
                caption,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        }

    } catch (e) {
        console.error('Movie command error:', e.message);
        reply("❌ Error occurred while fetching movie data.");
    }
});
