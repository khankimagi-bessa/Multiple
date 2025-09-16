const { plugin, commands, mode } = require('../lib');
const { BOT_INFO, PREFIX, MENU_IMAGE_URL } = require('../config');
const { version } = require('../package.json');
const { fancy } = require('../lib/extra');
const os = require('os');
const fs = require('fs');
const axios = require('axios');

const runtime = secs => {
  const pad = s => s.toString().padStart(2, '0');
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
};

const readMore = String.fromCharCode(8206).repeat(4001);

function externalMenuPreview(profileImageBuffer, options = {}) {
  return {
    showAdAttribution: true,
    title: options.title || '𝐑4𝐁𝐁𝐈𝐓 𝐌𝐈𝐍𝐈',
    body: options.body || '𝐑4𝐁𝐁𝐈𝐓 𝐂𝐎𝐌𝐌𝐀𝐍𝐃',
    thumbnail: profileImageBuffer,
    sourceUrl: options.sourceUrl || 'https://whatsapp.com/channel/0029VbAnkJQ5q08d0hilkS2J',
    mediaType: 1,
    renderLargerThumbnail: true
  };
}

plugin({
  pattern: 'menu|list',
  desc: 'Displays the command menu',
  type: 'whatsapp',
  fromMe: mode
}, async (message) => {
  const [botName] = BOT_INFO.split(';');
  const userName = message.pushName || 'User';
  const usedGB = ((os.totalmem() - os.freemem()) / 1073741824).toFixed(2);
  const totGB = (os.totalmem() / 1073741824).toFixed(2);
  const ram = `${usedGB} / ${totGB} GB`;

  let menuText = `
*╭══〘〘 ${botName} 〙〙*
*┃❍ ᴏᴡɴᴇʀ   :* 𝐌𝐑 𝐑4𝐁𝐁𝐈𝐓
*┃❍ ᴍᴏᴅᴇ    :* ${mode ? 'Private' : 'Public'}
*┃❍ ᴘʀᴇғɪx  :* ${PREFIX}
*┃❍ ʀᴜɴ     :* ${runtime(process.uptime())}
*┃❍ ᴄᴏᴍᴍᴀɴᴅs:* ${commands.length}
*┃❍ ᴜsᴇʀ    :* ${userName}
*┃❍ ᴠᴇʀsɪᴏɴ :* v${version}
*┃❍ ᴘʟᴀᴛғᴏʀᴍ :* 𝐑4𝐁𝐁𝐈𝐓 𝐒𝐄𝐑𝐕𝐄𝐑
*╰═════════════════⊷*
${readMore}
*♡︎•━━━━━━☻︎━━━━━━•♡︎*
`;

  let cmnd = [], category = [];

  for (const command of commands) {
    const cmd = command.pattern?.toString().match(/(\W*)([A-Za-z0-9]*)/)?.[2];
    if (!command.dontAddCommandList && cmd) {
      const type = (command.type || "misc").toUpperCase();
      cmnd.push({ cmd, type });
      if (!category.includes(type)) category.push(type);
    }
  }

  for (const cat of category.sort()) {
    menuText += `\n *╭────❒ ${cat} ❒⁠⁠⁠⁠*\n`;
    for (const { cmd, type } of cmnd.filter(c => c.type === cat)) {
      menuText += ` *├◈ ${cmd}*\n`;
    }
    menuText += ` *┕──────────────────❒*\n`;
  }

  menuText += `\n💖 *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐑4𝐁𝐁𝐈𝐓*`;

  try {
    let buffer;
    if (MENU_IMAGE_URL) {
      if (MENU_IMAGE_URL.startsWith('http')) {
        // Online URL
        const res = await axios.get(MENU_IMAGE_URL, { responseType: 'arraybuffer' });
        buffer = Buffer.from(res.data, 'binary');
      } else if (fs.existsSync(MENU_IMAGE_URL)) {
        // Local file
        buffer = fs.readFileSync(MENU_IMAGE_URL);
      }
    }

    if (buffer) {
      await message.client.sendMessage(message.jid, {
        text: menuText,
        contextInfo: {
          externalAdReply: externalMenuPreview(buffer)
        }
      });
    } else {
      await message.send(menuText + `\n\n⚠️ *Menu image not found, sending text only.*`);
    }
  } catch (err) {
    console.error('❌ Menu send error:', err);
    await message.send(menuText + `\n\n⚠️ *Media failed to load, sending text only.*`);
  }
});
