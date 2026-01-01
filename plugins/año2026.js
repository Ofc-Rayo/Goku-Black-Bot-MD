const we = 5000
let cooldown = 604800000 // 7 días

const mssg = {
  weeklyCd: 'Aún no puedes reclamar tu premio semanal.',
  weekly: 'Premio semanal reclamado con éxito',
  money: 'Coins',
  day: 'd',
  hour: 'h',
  minute: 'm'
}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (new Date() - user.weekly < cooldown)
    throw `⏱️ ${mssg.weeklyCd}\n*${msToTime((user.weekly + cooldown) - new Date())}*`

  user.coin += we

  m.reply(
`🎁 ${mssg.weekly}

🪙 *${mssg.money}* : +${we.toLocaleString()}`
  )

  user.weekly = new Date() * 1
}

handler.help = ['weekly']
handler.tags = ['econ']
handler.command = ['weekly', 'semanal']

export default handler

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60)
  var minutes = Math.floor((duration / (1000 * 60)) % 60)
  var hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  var days = Math.floor(duration / (1000 * 60 * 60 * 24))

  return `${days} ${mssg.day} ${hours} ${mssg.hour} ${minutes} ${mssg.minute}`
}