import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) throw '🍟 Ingresa el link de TikTok'

  let creator = 'IvanDev'

  try {
    let { data } = await axios.get(
      `https://tikwm.com/api/?url=${encodeURIComponent(text)}`
    )

    if (!data || !data.data || !data.data.images || !data.data.images.length)
      throw '🍟 No se encontraron imágenes'

    await m.react('🕓')

    for (let img of data.data.images) {
      await conn.sendFile(
        m.chat,
        img,
        'tiktok.jpg',
        `© ${creator}`,
        m
      )
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