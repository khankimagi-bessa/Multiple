const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function facebookCommand(sock, chatId, message) {
    try {
        // Get text from command or reply
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const url = text.split(' ').slice(1).join(' ').trim();

        if (!url) {
            return await message.client.sendMessage(chatId, { 
                text: "❌ Please provide a Facebook video URL.\nExample: .fb https://www.facebook.com/..."
            });
        }

        // Validate Facebook URL
        if (!url.includes('facebook.com')) {
            return await message.client.sendMessage(chatId, { 
                text: "❌ That is not a Facebook link."
            });
        }

        // Send loading reaction
        await message.client.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        // Fetch video data from API
        const response = await axios.get(`https://api.dreaded.site/api/facebook?url=${url}`);
        const data = response.data;

        if (!data || data.status !== 200 || !data.facebook || !data.facebook.sdVideo) {
            return await message.client.sendMessage(chatId, { 
                text: "⚠️ Sorry the API didn't respond correctly. Please try again later!"
            });
        }

        const fbvid = data.facebook.sdVideo;
        const title = data.facebook.title || "Facebook Video";

        if (!fbvid) {
            return await message.client.sendMessage(chatId, { 
                text: "❌ Could not find video. Make sure the video exists."
            });
        }

        // Create temp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        // Temp file path
        const tempFile = path.join(tmpDir, `fb_${Date.now()}.mp4`);

        // Download the video
        const videoResponse = await axios({
            method: 'GET',
            url: fbvid,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                'Range': 'bytes=0-',
                'Connection': 'keep-alive',
                'Referer': 'https://www.facebook.com/'
            }
        });

        const writer = fs.createWriteStream(tempFile);
        videoResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Check download success
        if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
            throw new Error('Failed to download video');
        }

        // Send the video with stylish caption
        await message.client.sendMessage(chatId, {
            video: { url: tempFile },
            mimetype: "video/mp4",
            caption: `𝐅𝐛 𝐯𝐢𝐝𝐞𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐝 💟\n` +
                     `𝐓𝐢𝐭𝐥𝐞: ${title}\n\n` +
                     `> 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌4𝐁𝐁𝐈𝐓 💞`
        }, { quoted: message });

        // Clean up temp file
        try { fs.unlinkSync(tempFile); } catch (err) { console.error('Temp file cleanup error:', err); }

    } catch (error) {
        console.error('Error in Facebook command:', error);
        await message.client.sendMessage(chatId, { 
            text: "⚠️ An error occurred. API might be down. Please try again later."
        });
    }
}

module.exports = facebookCommand;
