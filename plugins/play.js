import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import crypto from "crypto"

function secondString(seconds) {
  seconds = Number(seconds) || 0
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [
    h > 0 ? h.toString().padStart(2, "0") : null,
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0")
  ].filter(Boolean).join(":")
}

async function resizeImage(buffer, size = 300) {
  const image = await Jimp.read(buffer)
  return image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
}

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
    hexToBuffer: (hex) => Buffer.from(hex.match(/.{1,2}/g).join(""), "hex"),
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
    const p = [
      /youtube.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu.be\/([a-zA-Z0-9_-]{11})/
    ]
    for (const r of p) {
      const m = url.match(r)
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
    if (!savetube.isUrl(link)) return { status: false }
    const id = savetube.youtube(link)
    const cdn = await savetube.getCDN()
    const info = await savetube.request(
      `https://${cdn.data}${savetube.api.info}`,
      { url: `https://www.youtube.com/watch?v=${id}` }
    )
    const dec = await savetube.crypto.decrypt(info.data.data)
    const dl = await savetube.request(
      `https://${cdn.data}${savetube.api.download}`,
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
  if (!text) return

  let yt

  if (savetube.isUrl(text)) {
    const id = savetube.youtube(text)
    const r = await yts({ videoId: id })
    yt = {
      title: r.title,
      duration: secondString(r.seconds),
      thumbnail: r.thumbnail,
      author: r.author?.name || "YouTube",
      url: text
    }
  } else {
    const r = await yts.search(text)
    if (!r.videos.length) return
    const v = r.videos[0]
    yt = {
      title: v.title,
      duration: secondString(v.duration.seconds),
      thumbnail: v.thumbnail,
      author: v.author.name,
      url: v.url
    }
  }

  const img = await resizeImage(
    await (await fetch(yt.thumbnail)).buffer()
  )

  const dl = await savetube.download(yt.url)
  if (!dl.status) return

  const caption = `
🎶 *${yt.title}*
📺 *Canal:* ${yt.author}
⏱️ *Duración:* ${yt.duration}
🔗 *YouTube:* ${yt.url}

✅ Audio listo. ¡Disfrútalo! 🔊
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: yt.thumbnail },
    caption
  }, { quoted: m })

  await conn.sendMessage(m.chat, {
    audio: { url: dl.result.download },
    mimetype: "audio/mpeg",
    fileName: `${dl.result.title}.mp3`,
    jpegThumbnail: img
  }, { quoted: m })

  await m.react("✅")
}

handler.command = ["play"]
handler.tags = ["descargas"]
handler.help = ["play"]

export default handler