const {
  cmd,
  commands
} = require("../command");
const {
  fetchJson
} = require('../lib/functions');
cmd({
  'pattern': 'ai',
  'alias': ["gpt", "bot"],
  'react': '🧠',
  'desc': "ai chat.",
  'category': "main",
  'filename': __filename
}, async (_0x2dd0eb, _0x34765a, _0x5223b1, {
  from: _0x4103d9,
  quoted: _0x1c703f,
  body: _0xb6c5fe,
  isCmd: _0xd3d42a,
  command: _0x4d4c06,
  args: _0x2a6f8e,
  q: _0x18efa4,
  isGroup: _0x5116f5,
  sender: _0x19e329,
  senderNumber: _0xcd5b43,
  botNumber2: _0x21c776,
  botNumber: _0x295182,
  pushname: _0x1024b4,
  isMe: _0x2e24ef,
  isOwner: _0x16bf8b,
  groupMetadata: _0x2c78a2,
  groupName: _0x4bade2,
  participants: _0x3188ce,
  groupAdmins: _0x10f679,
  isBotAdmins: _0x1f63fb,
  isAdmins: _0x4153dd,
  reply: _0x2ef217
}) => {
  try {
    let _0x3ed650 = await fetchJson("https://api.davidcyriltech.my.id/ai/chatbot?query=" + _0x18efa4);
    return _0x2ef217('' + _0x3ed650.data);
  } catch (_0x239e80) {
    console.log(_0x239e80);
    _0x2ef217('' + _0x239e80);
  }
});
