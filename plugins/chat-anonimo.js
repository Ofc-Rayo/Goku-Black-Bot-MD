// CODIGO EN TESTING
async function handler(m, { usedPrefix, command, args }) {
command = command.toLowerCase()
this.anonymous = this.anonymous ? this.anonymous : {}
this.anonymousInv = this.anonymousInv ? this.anonymousInv : {}

switch (command) {

case 'invite': {
if (!args[0]) return m.reply('❌ Ingresa el número\nEj: .invite 595xxxxxxxx')
let number = args[0].replace(/\D/g, '') + '@s.whatsapp.net'

if (number === m.sender) return m.reply('❌ No puedes invitarte a ti mismo')
if (Object.values(this.anonymous).find(r => r.check(m.sender))) return m.reply('❌ Ya estás en un chat anónimo')

this.anonymousInv[number] = m.sender

await this.sendMessage(number, {
text: `👤 *Chat Anónimo*\n\nUna persona te ha invitado a unirte a una sala de chat anónimo.\n\n¿Aceptas?\n\n✅ *Aceptar:* ${usedPrefix}accept\n❌ *Rechazar:* ${usedPrefix}reject`
})

m.reply('✅ Invitación enviada')
break
}

case 'accept': {
let inviter = this.anonymousInv[m.sender]
if (!inviter) return m.reply('❌ No tienes invitaciones')

let id = +new Date()
this.anonymous[id] = {
id,
a: inviter,
b: m.sender,
state: 'CHATTING',
check(who = '') {
return [this.a, this.b].includes(who)
},
other(who = '') {
return who === this.a ? this.b : who === this.b ? this.a : ''
}
}

delete this.anonymousInv[m.sender]

await this.sendMessage(inviter, { text: '✅ La persona aceptó, chat iniciado' })
await this.sendMessage(m.sender, { text: '✅ Chat anónimo iniciado' })
break
}

case 'reject': {
if (!this.anonymousInv[m.sender]) return m.reply('❌ No tienes invitaciones')
let inviter = this.anonymousInv[m.sender]
delete this.anonymousInv[m.sender]
await this.sendMessage(inviter, { text: '❌ La persona rechazó la invitación' })
m.reply('❌ Invitación rechazada')
break
}

case 'leave':
case 'next': {
let room = Object.values(this.anonymous).find(room => room.check(m.sender))
if (!room) return m.reply('❌ No estás en un chat anónimo')

let other = room.other(m.sender)
m.reply('👋 Saliste del chat')

if (other) await this.sendMessage(other, { text: '👋 La otra persona salió del chat' })

delete this.anonymous[room.id]
if (command === 'leave') break
}

case 'start': {
if (Object.values(this.anonymous).find(room => room.check(m.sender)))
return m.reply('❌ Ya estás en un chat')

let room = Object.values(this.anonymous).find(room => room.state === 'WAITING' && !room.check(m.sender))
if (room) {
room.b = m.sender
room.state = 'CHATTING'
await this.sendMessage(room.a, { text: '✅ Chat anónimo iniciado' })
await this.sendMessage(m.sender, { text: '✅ Chat anónimo iniciado' })
} else {
let id = +new Date()
this.anonymous[id] = {
id,
a: m.sender,
b: '',
state: 'WAITING',
check(who = '') {
return [this.a, this.b].includes(who)
},
other(who = '') {
return who === this.a ? this.b : who === this.b ? this.a : ''
}
}
m.reply('⏳ Esperando a otra persona...')
}
break
}

}
}

handler.help = ['start', 'leave', 'next', 'invite', 'accept', 'reject']
handler.tags = ['anonymous']
handler.command = ['start', 'leave', 'next', 'invite', 'accept', 'reject']
handler.private = true

export default handler

// CODIGO COMBINADO BY RAYO
let anonForward = (m) => m
anonForward.before = async function (m, {conn}) {
if (!m.chat.endsWith('@s.whatsapp.net')) return !0
this.anonymous = this.anonymous ? this.anonymous : {}
let room = Object.values(this.anonymous).find((room) => [room.a, room.b].includes(m.sender) && room.state === 'CHATTING')
if (room) {
if (/^.*(next|leave|start|invite|accept|reject)/.test(m.text)) return
let other = [room.a, room.b].find((user) => user !== m.sender)
await m.copyNForward(other, true)
}
return !0
}
export { anonForward as default }