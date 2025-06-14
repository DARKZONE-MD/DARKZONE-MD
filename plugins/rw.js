const {
  cmd,
  commands
} = require("../command");
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
} = require("../lib/functions");
const axios = require("axios");
cmd({
  'pattern': 'rw',
  'alias': ["randomwall", "wallpaper"],
  'react': '🌌',
  'desc': "Download random wallpapers based on keywords.",
  'category': 'wallpapers',
  'use': ".rw <keyword>",
  'filename': __filename
}, async (_0x4e03bc, _0x345d21, _0x40a30e, {
  from: _0x12db73,
  args: _0x22efc8,
  reply: _0x2f266c
}) => {
  try {
    const _0x2d400f = _0x22efc8.join(" ") || "random";
    const _0x3ba124 = "https://pikabotzapi.vercel.app/random/randomwall/?apikey=anya-md&query=" + _0x2d400f;
    const _0x235f6c = await axios.get(_0x3ba124);
    if (_0x235f6c.data.status) {
      const _0x3a965b = _0x235f6c.data.imgUrl;
      const _0x122bb7 = "🌌 Random Wallpaper: *" + _0x2d400f + "*\n\n> *©𝙺𝙴𝙴𝙽𝙻𝚈 𝚇𝙼𝙳*";
      await _0x4e03bc.sendMessage(_0x12db73, {
        'image': {
          'url': _0x3a965b
        },
        'caption': _0x122bb7
      }, {
        'quoted': _0x345d21
      });
    } else {
      _0x2f266c("❌ Failed to fetch wallpaper for \"" + _0x2d400f + "\".");
    }
  } catch (_0x56a8ca) {
    console.error(_0x56a8ca);
    _0x2f266c("❌ An error occurred while fetching the wallpaper.");
  }
});
