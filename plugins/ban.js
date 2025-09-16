const { plugin, personalDB } = require('../lib');

const DEVELOPERS = [
    '917439382677@s.whatsapp.net', // 
    '919874188403@s.whatsapp.net', //
    '000000000000@s.whatsapp.net',
    '111111111111@s.whatsapp.net'
];

plugin({
    pattern: 'ban ?(.*)',
    desc: 'Deactivate bot in specified JID',
    type: 'owner',
    root: true
}, async (message, match) => {
    // Developer check
    if (!DEVELOPERS.includes(message.sender)) {
        return await message.send("❌ Sorry, only authorized developers can use this command.");
    }

    const { ban } = await personalDB(['ban'], { content: {} }, 'get');

    if (ban && ban.includes(message.jid)) {
        return await message.send("⚠️ Bot is already deactivated in this chat.");
    }

    const update = ban ? ban + ',' + message.jid : message.jid;
    await personalDB(['ban'], { content: update }, 'set');

    await message.send("✅ Bot has been deactivated in this chat.");
    process.exit(0);
});

plugin({
    pattern: 'unban ?(.*)',
    desc: 'Activate bot in deactivated JID',
    type: 'owner',
    root: true
}, async (message, match) => {
    // Developer check
    if (!DEVELOPERS.includes(message.sender)) {
        return await message.send("❌ Sorry, only authorized developers can use this command.");
    }

    const { ban } = await personalDB(['ban'], { content: {} }, 'get');

    if (!ban || !ban.includes(message.jid)) {
        return await message.send("⚠️ Bot is not deactivated in this chat.");
    }

    const update = ban.split(',').filter(a => a !== message.jid);
    await personalDB(['ban'], { content: update.join(",") }, 'set');

    await message.send("✅ Bot has been reactivated in this chat. Restarting now...");
    process.exit(0);
});
