const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');
const ffmpeg = require('fluent-ffmpeg');
const { fromBuffer } = require('file-type');
const { plugin, mode, getBuffer } = require('../lib');

plugin({
  pattern: 'menurl',
  desc: 'Convert audio to black background video and upload',
  fromMe: mode,
  type: "converter"
}, async (message, match) => {
  const tmpFiles = [];
  try {
    let buffer = null;
    let mimeType = '';
    const possibleUrl = (match || '').trim();

    // If URL is provided
    if (possibleUrl.startsWith('http')) {
      buffer = await getBuffer(possibleUrl);
      const ft = await fromBuffer(buffer).catch(()=>null);
      if (ft && ft.mime) mimeType = ft.mime;
    }
    // Else check if replied to media
    else if (message.quoted) {
      const quotedMsg = message.quoted;
      mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
      buffer = await quotedMsg.download();
      const ft = await fromBuffer(buffer).catch(()=>null);
      if (ft && ft.mime) mimeType = ft.mime;
    } else {
      return await message.reply("⚠️ Reply to an audio file or provide an audio URL.");
    }

    if (!mimeType.includes('audio')) {
      return await message.reply("⚠️ Only audio files are allowed here.");
    }

    // Save audio temporarily
    const audioTemp = path.join(os.tmpdir(), `audio_${Date.now()}.mp3`);
    fs.writeFileSync(audioTemp, buffer);
    tmpFiles.push(audioTemp);

    const outVideo = path.join(os.tmpdir(), `black_${Date.now()}.mp4`);
    tmpFiles.push(outVideo);

    // Use ffmpeg to create black background video
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input('color=black:size=720x720:rate=25')
        .inputFormat('lavfi')
        .input(audioTemp)
        .outputOptions([
          '-c:v libx264',
          '-tune stillimage',
          '-c:a aac',
          '-b:a 192k',
          '-pix_fmt yuv420p',
          '-shortest'
        ])
        .save(outVideo)
        .on('end', resolve)
        .on('error', reject);
    });

    const videoUrl = await uploadToCatbox(outVideo, 'black_video.mp4');
    cleanup(tmpFiles);

    return await message.reply(
      `✅ *Audio → Video Converted & Uploaded*\n` +
      `*Type:* Video (black background)\n` +
      `*URL:* ${videoUrl}`
    );

  } catch (err) {
    console.error(err);
    await message.reply("🙁 Error: Please try again later.");
    cleanup(tmpFiles);
  }
});

// -------- helpers --------
async function uploadToCatbox(filePath, filename) {
  const form = new FormData();
  form.append('fileToUpload', fs.createReadStream(filePath), filename);
  form.append('reqtype', 'fileupload');
  const resp = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders(),
    timeout: 30000
  });
  if (!resp.data) throw new Error('No response from Catbox');
  return resp.data.trim();
}

function cleanup(files) {
  for (const f of files) {
    try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
  }
}
