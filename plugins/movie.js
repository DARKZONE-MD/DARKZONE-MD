const axios = require('axios');

cmd({
    pattern: "movie",
    desc: "Download or get info about movies.",
    category: "utility",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, reply, sender, args }) => {
    try {
        // Get query from args or use default
        const query = args.length > 0 ? args.join(' ') : null;
        
        // Build API URL based on whether we're searching or getting latest
        const apiUrl = query 
            ? `https://movie-database-api1.p.rapidapi.com/list_movies.json?query_term=${encodeURIComponent(query)}`
            : `https://movie-database-api1.p.rapidapi.com/list_movies.json?limit=20&page=1&quality=all&genre=all&minimum_rating=0&sort_by=date_added&order_by=desc&with_rt_ratings=false`;
        
        // Make API request
        const response = await axios.get(apiUrl, {
            headers: {
                'x-rapidapi-host': 'movie-database-api1.p.rapidapi.com',
                'x-rapidapi-key': '8f8214432dmshe2d6730ba6b5541p119a35jsna12406472100'
            }
        });
        
        const data = response.data;
        
        // Check if movies were found
        if (!data.data || !data.data.movies || data.data.movies.length === 0) {
            return reply(`🎬 *No movies found* ${query ? `for "${query}"` : ''}. Try a different search term.`);
        }
        
        // Process the first movie (or multiple if no query)
        if (query) {
            // For specific search, show details of the first match
            const movie = data.data.movies[0];
            await sendMovieDetails(conn, from, movie);
        } else {
            // For latest movies, send list with basic info
            const movies = data.data.movies.slice(0, 20);
            let message = `🎬 *Recently Added Movies (${movies.length})*\n\n`;
            
            movies.forEach((movie, index) => {
                message += `*${index + 1}.* ${movie.title} (${movie.year}) - ${movie.rating}/10 ⭐\n`;
                message += `🔗 *Download*: .movie ${movie.title}\n\n`;
            });
            
            message += `_Send .movie [title] for details and download links._`;
            await conn.sendMessage(from, { text: message }, { quoted: mek });
        }
    } catch (error) {
        console.error('Movie command error:', error);
        reply('❌ *Error fetching movie data*. Please try again later.');
    }
});

async function sendMovieDetails(conn, chatId, movie) {
    try {
        // Build the detailed message
        let message = `🎬 *${movie.title}* (${movie.year})\n\n`;
        message += `⭐ *Rating:* ${movie.rating}/10\n`;
        message += `⏱ *Runtime:* ${movie.runtime} minutes\n`;
        message += `🌐 *Language:* ${movie.language}\n`;
        message += `🎭 *Genres:* ${movie.genres.join(', ')}\n\n`;
        message += `📝 *Summary:* ${movie.summary || 'Not available'}\n\n`;
        
        // Add torrent links if available
        if (movie.torrents && Object.keys(movie.torrents).length > 0) {
            message += `📥 *Download Links:*\n`;
            Object.entries(movie.torrents).forEach(([quality, torrent]) => {
                message += `- *${quality.toUpperCase()}* (${torrent.type}): ${torrent.url}\n`;
            });
        } else {
            message += `⚠️ *No download links available*\n`;
        }
        
        // Send image with caption
        await conn.sendMessage(chatId, {
            image: { url: movie.large_cover_image || movie.medium_cover_image },
            caption: message,
            contextInfo: {
                externalAdReply: {
                    title: movie.title,
                    body: `🎬 ${movie.year} | Rating: ${movie.rating}`,
                    thumbnail: await axios.get(movie.medium_cover_image, { responseType: 'arraybuffer' })
                        .then(res => Buffer.from(res.data, 'binary'))
                        .catch(() => null)
                }
            }
        });
    } catch (error) {
        console.error('Error sending movie details:', error);
        throw error;
    }
}
