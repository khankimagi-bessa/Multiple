const {
  plugin,
  mode
} = require('../lib');

plugin({
  pattern: 'ping|pong',
  desc: 'Check bot response speed',
  react: '🏓',
  fromMe: mode,
  type: 'info'
}, async (message) => {
  const start = new Date().getTime();

  await message.send('🏓 Pinging...');

  const end = new Date().getTime();
  const ping = end - start;

  const styledText = `◈\n*╰┈➤ 𝐏𝐎𝐍𝐆: ${ping} ms*`;

  const channelJid = "120363420208876417@newsletter";
  const channelName = "𝐑4𝐁𝐁𝐈𝐓";         
  const serverMessageId = 1;

  await message.client.sendMessage(message.jid, {
    text: styledText,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelJid,
        newsletterName: channelName,
        serverMessageId: serverMessageId
      }
    }
  });
});
