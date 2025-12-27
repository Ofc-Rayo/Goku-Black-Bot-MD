import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import crypto from "crypto"

async function resizeImage(buffer, size = 300) {
  const image = await Jimp.read(buffer)
  return image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
}

const name = 'Descargas - YouTube'

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    info: "/v2/info",
    download: "/download",
    cdn: "/random-cdn"
  },
  headers: {
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://yt.savetube.me",
    referer: "https://yt.savetube.me/",
    "user-agent": "Postify/1.0.0"
  },
  crypto: {
    hexToBuffer: (hexString) => {
      const matches = hexString.match(/.{1,2}/g)
      return Buffer.from(matches.join(""), "hex")
    },
    decrypt: async (enc) => {
      const secretKey = "C5D58EF67A7584E4A29F6C35BBC4EB12"
      const data = Buffer.from(enc, "base64")
      const iv = data.slice(0, 16)
      const content = data.slice(16)
      const key = savetube.crypto.hexToBuffer(secretKey)
      const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv)
      let decrypted = decipher.update(content)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return JSON.parse(decrypted.toString())
    }
  },
  isUrl: (str) => {
    try {
      new URL(str)
      return /youtube.com|youtu.be/.test(str)
    } catch {
      return false
    }
  },
  youtube: (url) => {
    const patterns = [
      /youtube.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtu.be\/([a-zA-Z0-9_-]{11})/
    ]
    for (let p of patterns) {
      const m = url.match(p)
      if (m) return m[1]
    }
    return null
  },
  request: async (endpoint, data = {}, method = "post") => {
    try {
      const { data: res } = await axios({
        method,
        url: `${endpoint.startsWith("http") ? "" : savetube.api.base}${endpoint}`,
        data: method === "post" ? data : undefined,
        params: method === "get" ? data : undefined,
        headers: savetube.headers
      })
      return { status: true, data: res }
    } catch (e) {
      return { status: false, error: e.message }
    }
  },
  getCDN: async () => {
    const r = await savetube.request(savetube.api.cdn, {}, "get")
    if (!r.status) return r
    return { status: true, data: r.data.cdn }
  },
  download: async (link) => {
    if (!savetube.isUrl(link)) return { status: false, error: "URL inválida" }
    const id = savetube.youtube(link)
    if (!id) return { status: false, error: "ID inválido" }

    const cdnx = await savetube.getCDN()
    if (!cdnx.status) return cdnx

    const info = await savetube.request(
      `https://${cdnx.data}${savetube.api.info}`,
      { url: `https://www.youtube.com/watch?v=${id}` }
    )
    if (!info.status) return info

    const dec = await savetube.crypto.decrypt(info.data.data)
    const dl = await savetube.request(
      `https://${cdnx.data}${savetube.api.download}`,
      { id, downloadType: "audio", quality: "mp3", key: dec.key }
    )

    return {
      status: true,
      result: {
        title: dec.title,
        download: dl.data.data.downloadUrl,
        thumbnail: dec.thumbnail
      }
    }
  }
}

const handler = async (m, { conn, text }) => {
  await m.react("⌛")
  if (!text) return m.reply("🎧 Escribe el nombre o link del video")

  let url, yt_play
  if (savetube.isUrl(text)) {
    const id = savetube.youtube(text)
    const r = await yts({ videoId: id })
    yt_play = [{
      title: r.title,
      ago: r.ago,
      duration: { seconds: r.seconds },
      thumbnail: r.thumbnail,
      url: text
    }]
    url = text
  } else {
    const r = await yts.search(text)
    if (!r.videos.length) return m.reply("❌ No encontrado")
    yt_play = [r.videos[0]]
    url = r.videos[0].url
  }

  const img = await resizeImage(
    await (await fetch(yt_play[0].thumbnail)).buffer()
  )

  await m.reply(`📄 *Título* : ${yt_play[0].title}
🗓️ *Publicado:* ${yt_play[0].ago}
⌛ *Duración:* ${secondString(yt_play[0].duration.seconds)}

_*Descargado el audio 📼, aguarden un momento....*_`)

  const dl = await savetube.download(url)
  if (!dl.status) return m.reply("❌ Error al descargar")

  await conn.sendMessage(
    m.chat,
    {
      audio: { url: dl.result.download },
      mimetype: "audio/mpeg",
      fileName: `${dl.result.title}.mp3`,
      jpegThumbnail: img
    },
    { quoted: m }
  )

  await m.react("✅")
}

handler.command = ["play"]
handler.help = ["play"]
handler.tags = ["descargas"]

export default handler