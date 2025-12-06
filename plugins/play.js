import { ytmp3, ytmp4 } from '../lib/sadl.js';
import ytSearch from 'yt-search';

const YT_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;

const handler = async (message, { conn, text, command }) => {
  try {
    let fakeReply = null;
    try {
      const img = await fetch('https://i.postimg.cc/k5JmXxmT/Nuevo-proyecto-8694C3E.png');
      const buffer = Buffer.from(await img.arrayBuffer());
      fakeReply = {
        key: {
          participant: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "halo"
        },
        message: {
          locationMessage: {
            name: "YouTube - Download",
            jpegThumbnail: buffer
          }
        }
      };
    } catch {}

    if (!text || !text.trim()) {
      return conn.reply(message.chat, "✧ ¡Debes escribir el *nombre o link* del video/audio para descargar!", message);
    }

    await conn.sendMessage(message.chat, {
      react: { text: '⏳', key: message.key }
    });

    const match = text.match(YT_REGEX);

    let result = await ytSearch(match ? "https://youtu.be/" + match[1] : text);

    if (match) {
      const id = match[1];
      result =
        result.all.find(v => v.videoId === id) ||
        result.videos.find(v => v.videoId === id);
    } else {
      result = result.all?.[0] || result.videos?.[0];
    }

    if (!result) {
      await conn.sendMessage(message.chat, { react: { text: '❌', key: message.key } });
      return conn.reply(message.chat, "⚠ No encontré resultados, intenta con otro nombre o link.");
    }

    const {
      title,
      thumbnail,
      timestamp,
      views,
      ago,
      url,
      author
    } = result;

    const infoMsg = `
🦭 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼 𝙀𝙉 𝘾𝘼𝙈𝙄𝙉𝙊

📌 *Título:* ${title}
📺 *Canal:* ${author?.name || "Desconocido"}
⏱ *Duración:* ${timestamp}
👁 *Vistas:* ${formatViews(views)}
📅 *Publicado:* ${ago}
🔗 *Link:* ${url}

⌛ Preparando tu descarga...
`.trim();

    const thumb = (await conn.getFile(thumbnail))?.data;

    await conn.sendMessage(message.chat, {
      text: infoMsg,
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: dev,
          mediaType: 1,
          thumbnail: thumb,
          renderLargerThumbnail: true,
          mediaUrl: url,
          sourceUrl: url
        }
      }
    }, { quoted: fakeReply });

    if (["play", "yta", "ytmp3", "playaudio"].includes(command)) {
      let audioData = null;

      try {
        const res = await ytmp3(url);
        if (res?.status && res?.download?.url) {
          audioData = { link: res.download.url, title: res.metadata?.title };
        }
      } catch {}

      if (!audioData) {
        await conn.sendMessage(message.chat, { react: { text: '❌', key: message.key } });
        return conn.reply(message.chat, "✦ No se pudo descargar el audio. Intenta más tarde.");
      }

      await conn.sendMessage(message.chat, {
        audio: { url: audioData.link },
        fileName: `${audioData.title || "audio"}.mp3`,
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: message });

      return conn.sendMessage(message.chat, { react: { text: '✅', key: message.key } });
    }

    if (["play2", "ytv", "ytmp4", "mp4"].includes(command)) {
      let videoData = null;

      try {
        const res = await ytmp4(url);
        if (res?.status && res?.download?.url) {
          videoData = { link: res.download.url, title: res.metadata?.title };
        }
      } catch {}

      if (!videoData) {
        await conn.sendMessage(message.chat, { react: { text: '❌', key: message.key } });
        return conn.reply(message.chat, "✦ No se pudo descargar el video. Intenta más tarde.");
      }

      await conn.sendMessage(message.chat, {
        video: { url: videoData.link },
        fileName: `${videoData.title || "video"}.mp4`,
        caption: title,
        mimetype: "video/mp4"
      }, { quoted: message });

      return conn.sendMessage(message.chat, { react: { text: '✅', key: message.key } });
    }

  } catch (err) {
    console.error(err);
    await conn.sendMessage(message.chat, { react: { text: '❌', key: message.key } });
    return conn.reply(message.chat, "⚠ Error inesperado. Por favor, reporta este problema.");
  }
};

handler.command = ["play", "yta", "ytmp3", "play2", "ytv", "ytmp4", "playaudio", "mp4"];
handler.help = handler.command;
handler.tags = ["descargas"];

export default handler;

function formatViews(num) {
  if (!num) return "No disponible";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return num.toString();
}