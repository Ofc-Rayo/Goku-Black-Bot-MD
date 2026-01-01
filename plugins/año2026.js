let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (user.premio2026) {
    throw '🎆 No vemos en otro año 😉\nEste premio ya fue reclamado.'
  }

  let year = new Date().getFullYear()
  if (year !== 2026) {
    throw '⏰ Este premio solo está disponible en el año 2026.'
  }

  let premio = 10000
  user.diamonds = (user.diamonds || 0) + premio
  user.premio2026 = true

  m.reply(`🏆 *PREMIO DEL AÑO 2026*\n\n💎 Has reclamado *${premio} diamantes* con éxito.\n¡Disfrútalos!`)
}

handler.help = ['premio2026']
handler.tags = ['economy']
handler.command = ['premio2026', '2026premio']

export default handler