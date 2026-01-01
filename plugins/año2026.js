let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  // Solo una vez
  if (user.premio2026) {
    throw '🎆 No vemos en otro año 😉\nEste premio ya fue reclamado.'
  }

  // Solo en 2026
  let year = new Date().getFullYear()
  if (year !== 2026) {
    throw '⏰ Este premio solo está disponible en el año 2026.'
  }

  let premio = 10000 // 10k diamantes

  // Asegurar que exista
  user.diamond = user.diamond || 0
  user.diamond += premio

  user.premio2026 = true

  m.reply(
    `🏆 *PREMIO DEL AÑO 2026*\n\n💎 Has recibido *${premio.toLocaleString()} diamantes*\n\n` +
    `💎 Total: *${user.diamond.toLocaleString()}*`
  )
}

handler.help = ['premio2026']
handler.tags = ['economy']
handler.command = ['premio2026', 'diamantes2026']

export default handler