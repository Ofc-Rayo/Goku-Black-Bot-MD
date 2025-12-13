import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text }) => {
  if (!text) throw '🍟 Ingresa el link de TikTok'

  let creator = 'IvanDev'
  let url = `https://dlpanda.com/id?url=${encodeURIComponent(text)}`

  try {
    let { data } = await axios.get(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'accept-language': 'en-US,en;q=0.9'
      }
    })

    const $ = cheerio.load(data)
    let images = []

    $('img').each((_, el) => {
      let src = $(el).attr('data-src') || $(el).attr('src')
      if (src && src.startsWith('http')) images.push(src)
    })

    if (!images.length) throw '🍟 No se encontraron imágenes'

    await m.react('🕓')
    for (let img of images) {
      await conn.sendFile(m.chat, img, 'tiktok.jpg', `© ${creator}`, m)
    }
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    throw '🍟 Error al descargar imágenes'
  }
}

handler.help = ['tiktokimg <url>']
handler.tags = ['descargas']
handler.command = ['tiktokimg', 'ttimg']

export default handler