const { fetchJson } = require("../lib/functions");
const axios = require("axios");
const { cmd, commands } = require('../command');

// Movie Search Command
cmd({
  pattern: "movie",
  alias: ["movies", "film", "search"],
  desc: "Search for movies in the database.",
  react: "ðŸŽ¬",
  category: "entertainment",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) {
      return reply("âŒ Please provide a movie name to search for.");
    }

    await conn.sendMessage(from, {
      react: { text: "â³", key: m.key }
    });

    const response = await axios.get(`https://movie-database-api1.p.rapidapi.com/list_movies.json`, {
      params: {
        limit: 10,
        page: 1,
        quality: 'all',
        genre: 'all',
        minimum_rating: 0,
        query_term: q,
        sort_by: 'date_added',
        order_by: 'desc',
        with_rt_ratings: false
      },
      headers: {
        'x-rapidapi-host': 'movie-database-api1.p.rapidapi.com',
        'x-rapidapi-key': '8f8214432dmshe2d6730ba6b5541p119a35jsna12406472100'
      }
    });

    const data = response.data;

    if (!data || !data.data || !data.data.movies || data.data.movies.length === 0) {
      return reply("âš ï¸ No movies found for your search query. Please try a different movie name.");
    }

    const movies = data.data.movies.slice(0, 5); // Show top 5 results
    let movieList = `â•­â”â”â”ã€” *MOVIE SEARCH RESULTS* ã€•â”â”â”âŠ·\n`;
    movieList += `â”ƒâ–¸ *Search Query:* ${q}\n`;
    movieList += `â”ƒâ–¸ *Found:* ${movies.length} movies\n`;
    movieList += `â•°â”â”â”âª¼\n\n`;

    movies.forEach((movie, index) => {
      movieList += `ðŸŽ¬ *${index + 1}. ${movie.title}*\n`;
      movieList += `ðŸ“… *Year:* ${movie.year}\n`;
      movieList += `â­ *Rating:* ${movie.rating}/10\n`;
      movieList += `ðŸŽ­ *Genre:* ${movie.genres ? movie.genres.join(', ') : 'N/A'}\n`;
      movieList += `â±ï¸ *Runtime:* ${movie.runtime} minutes\n`;
      movieList += `ðŸ“ *Summary:* ${movie.summary ? movie.summary.substring(0, 100) + '...' : 'No summary available'}\n`;
      movieList += `ðŸ”— *More Info:* ${movie.url}\n\n`;
    });

    movieList += `ðŸ“Œ *Reply with a number (1-${movies.length}) to get detailed info about a specific movie.*`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: movies[0].medium_cover_image || movies[0].large_cover_image },
      caption: movieList
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // Store movies data temporarily (in a real app, you'd use a database)
    global.movieSearchResults = global.movieSearchResults || {};
    global.movieSearchResults[messageID] = movies;

    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot && global.movieSearchResults[messageID]) {
        const selectedIndex = parseInt(receivedText) - 1;
        
        if (selectedIndex >= 0 && selectedIndex < global.movieSearchResults[messageID].length) {
          const selectedMovie = global.movieSearchResults[messageID][selectedIndex];
          
          await conn.sendMessage(senderID, {
            react: { text: 'ðŸŽ¬', key: receivedMsg.key }
          });

          const detailedInfo = `â•­â”â”â”ã€” *MOVIE DETAILS* ã€•â”â”â”âŠ·\n`
            + `â”ƒâ–¸ *Title:* ${selectedMovie.title}\n`
            + `â”ƒâ–¸ *Year:* ${selectedMovie.year}\n`
            + `â”ƒâ–¸ *Rating:* ${selectedMovie.rating}/10\n`
            + `â”ƒâ–¸ *Runtime:* ${selectedMovie.runtime} minutes\n`
            + `â”ƒâ–¸ *Language:* ${selectedMovie.language}\n`
            + `â”ƒâ–¸ *Genre:* ${selectedMovie.genres ? selectedMovie.genres.join(', ') : 'N/A'}\n`
            + `â”ƒâ–¸ *State:* ${selectedMovie.state}\n`
            + `â•°â”â”â”âª¼\n\n`
            + `ðŸ“ *Synopsis:*\n${selectedMovie.description_full || selectedMovie.summary || 'No description available'}\n\n`
            + `ðŸŽ­ *Cast:* ${selectedMovie.cast ? selectedMovie.cast.map(actor => actor.name).join(', ') : 'Cast information not available'}\n\n`
            + `ðŸ”— *IMDb:* ${selectedMovie.url}\n`
            + `ðŸ“¥ *Torrent Downloads:* ${selectedMovie.torrents ? selectedMovie.torrents.length : 0} available\n\n`
            + `ðŸŽ¬ *Powered By Movie Database API*`;

          await conn.sendMessage(senderID, {
            image: { url: selectedMovie.large_cover_image || selectedMovie.medium_cover_image },
            caption: detailedInfo
          }, { quoted: receivedMsg });

          // Clean up stored data
          delete global.movieSearchResults[messageID];
        } else {
          reply(`âŒ Invalid option! Please reply with a number between 1 and ${global.movieSearchResults[messageID].length}.`);
        }
      }
    });

  } catch (error) {
    console.error("Error:", error);
    reply("âŒ An error occurred while searching for movies. Please try again.");
  }
});

// Popular Movies Command
cmd({
  pattern: "popular",
  alias: ["trending", "topmovies"],
  desc: "Get popular/trending movies.",
  react: "ðŸ”¥",
  category: "entertainment",
  filename: __filename
}, async (conn, m, store, { from, reply }) => {
  try {
    await conn.sendMessage(from, {
      react: { text: "â³", key: m.key }
    });

    const response = await axios.get(`https://movie-database-api1.p.rapidapi.com/list_movies.json`, {
      params: {
        limit: 10,
        page: 1,
        quality: 'all',
        genre: 'all',
        minimum_rating: 7,
        query_term: '',
        sort_by: 'rating',
        order_by: 'desc',
        with_rt_ratings: false
      },
      headers: {
        'x-rapidapi-host': 'movie-database-api1.p.rapidapi.com',
        'x-rapidapi-key': '8f8214432dmshe2d6730ba6b5541p119a35jsna12406472100'
      }
    });

    const data = response.data;

    if (!data || !data.data || !data.data.movies || data.data.movies.length === 0) {
      return reply("âš ï¸ Failed to fetch popular movies. Please try again later.");
    }

    const movies = data.data.movies.slice(0, 8);
    let movieList = `â•­â”â”â”ã€” *POPULAR MOVIES* ã€•â”â”â”âŠ·\n`;
    movieList += `â”ƒâ–¸ *Top Rated Movies*\n`;
    movieList += `â”ƒâ–¸ *Minimum Rating:* 7.0+\n`;
    movieList += `â•°â”â”â”âª¼\n\n`;

    movies.forEach((movie, index) => {
      movieList += `ðŸ† *${index + 1}. ${movie.title}* (${movie.year})\n`;
      movieList += `â­ *Rating:* ${movie.rating}/10\n`;
      movieList += `ðŸŽ­ *Genre:* ${movie.genres ? movie.genres.slice(0, 2).join(', ') : 'N/A'}\n`;
      movieList += `â±ï¸ *Runtime:* ${movie.runtime} min\n\n`;
    });

    movieList += `ðŸŽ¬ *Use .movie <name> to search for specific movies*`;

    await conn.sendMessage(from, {
      image: { url: movies[0].large_cover_image || movies[0].medium_cover_image },
      caption: movieList
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("âŒ An error occurred while fetching popular movies. Please try again.");
  }
});

// Movies by Genre Command
cmd({
  pattern: "genre",
  alias: ["moviegenre", "genremovies"],
  desc: "Get movies by specific genre.",
  react: "ðŸŽ­",
  category: "entertainment",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) {
      return reply("âŒ Please provide a genre name.\n\n*Available genres:*\nAction, Adventure, Animation, Biography, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Sci-Fi, Sport, Thriller, War, Western");
    }

    await conn.sendMessage(from, {
      react: { text: "â³", key: m.key }
    });

    const response = await axios.get(`https://movie-database-api1.p.rapidapi.com/list_movies.json`, {
      params: {
        limit: 10,
        page: 1,
        quality: 'all',
        genre: q.toLowerCase(),
        minimum_rating: 0,
        query_term: '',
        sort_by: 'rating',
        order_by: 'desc',
        with_rt_ratings: false
      },
      headers: {
        'x-rapidapi-host': 'movie-database-api1.p.rapidapi.com',
        'x-rapidapi-key': '8f8214432dmshe2d6730ba6b5541p119a35jsna12406472100'
      }
    });

    const data = response.data;

    if (!data || !data.data || !data.data.movies || data.data.movies.length === 0) {
      return reply(`âš ï¸ No movies found for genre "${q}". Please try a different genre.`);
    }

    const movies = data.data.movies.slice(0, 6);
    let movieList = `â•­â”â”â”ã€” *${q.toUpperCase()} MOVIES* ã€•â”â”â”âŠ·\n`;
    movieList += `â”ƒâ–¸ *Genre:* ${q}\n`;
    movieList += `â”ƒâ–¸ *Found:* ${movies.length} movies\n`;
    movieList += `â•°â”â”â”âª¼\n\n`;

    movies.forEach((movie, index) => {
      movieList += `ðŸŽ¬ *${index + 1}. ${movie.title}* (${movie.year})\n`;
      movieList += `â­ *Rating:* ${movie.rating}/10\n`;
      movieList += `â±ï¸ *Runtime:* ${movie.runtime} min\n`;
      movieList += `ðŸ“ *Summary:* ${movie.summary ? movie.summary.substring(0, 80) + '...' : 'No summary'}\n\n`;
    });

    movieList += `ðŸŽ­ *Use .movie <name> to get detailed info about any movie*`;

    await conn.sendMessage(from, {
      image: { url: movies[0].large_cover_image || movies[0].medium_cover_image },
      caption: movieList
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("âŒ An error occurred while fetching movies by genre. Please try again.");
  }
});
