import fetch from 'node-fetch'

var handler = async (m, { conn, usedPrefix, command, text }) => {

conn.dropmail = conn.dropmail ? conn.dropmail : {}
let id = 'dropmail'

let lister = ['create', 'message', 'delete']

const [feature] = text.split(' ')
if (!lister.includes(feature)) return m.reply(
`❛ ༉‧₊˚✧☆
El mᥱȷ᥆r ᑲ᥆𝗍 ძᥱ ᥕһᥲ𝗍sᥲ⍴⍴
❛ ༉‧₊˚✧☆

✦ ᥱȷᥱmρᥣ᥆
${usedPrefix + command} create

✦ sᥱᥣᥱᥴᥴі᥆ᥒᥲ ᥙᥒᥲ ᥆ρᥴі᥆ᥒ
${lister.map(v => `✧ ${v}`).join('\n')}`
)

if (feature === 'create') {
try {
let eml = await random_mail()
const timeDiff = new Date(eml[2]) - new Date()
conn.dropmail[id] = [
await conn.reply(
m.chat,
`❛ ༉‧₊˚✧☆
📧 ᥴ᥆rrᥱ᥆ 𝗍ᥱmρ᥆rᥲᥣ
❛ ༉‧₊˚✧☆

✦ ᥱmᥲіᥣ
${eml[0]}

✦ іძ
${eml[1]}

✦ ᥱ᥊ρіrᥲ
${msToTime(timeDiff)}

✦ ᥙsᥲ
${usedPrefix + command} message`,
m
),
eml[0],
eml[1],
eml[2],
]
} catch (e) {
await conn.reply(m.chat,
`❛ ༉‧₊˚✧☆
🚩 ᥆ᥴᥙrrі᥆́ ᥙᥒ ᥱrr᥆r
❛ ༉‧₊˚✧☆`, m)
}
}

if (feature === 'message') {
if (!conn.dropmail[id]) return conn.reply(
m.chat,
`❛ ༉‧₊˚✧☆
🚩 ᥒ᥆ һᥲᥡ ᥴ᥆rrᥱ᥆
✦ ᥙsᥲ ${usedPrefix + command} create
❛ ༉‧₊˚✧☆`,
m
)

try {
const eml = await get_mails(conn.dropmail[id][2])
if (!eml[1]) return m.reply(
`❛ ༉‧₊˚✧☆
📭 ᥒ᥆ һᥲᥡ mᥱᥒsᥲȷᥱs
❛ ༉‧₊˚✧☆`
)

for (let i = 0; i < eml[0].length; i++) {
let v = eml[0][i]
await conn.reply(
m.chat,
`❛ ༉‧₊˚✧☆
✉️ ᥱmᥲіᥣ ${i + 1}
❛ ༉‧₊˚✧☆

✦ ძᥱ
${v.fromAddr}

✦ ρᥲrᥲ
${v.toAddr}

✦ mᥱᥒsᥲȷᥱ
${v.text}

✦ 𝗍ᥲmᥲᥒ̃᥆
${formatSize(v.rawSize)}

✦ ᥲsᥙᥒ𝗍᥆
${v.headerSubject}

✦ ძᥱsᥴᥲrɡᥲ
${v.downloadUrl}`,
m
)
}
} catch (e) {
await m.reply(
`❛ ༉‧₊˚✧☆
🚩 ᥆ᥴᥙrrі᥆́ ᥙᥒ ᥱrr᥆r
❛ ༉‧₊˚✧☆`
)
}
}

if (feature === 'delete') {
if (!conn.dropmail[id]) return conn.reply(
m.chat,
`❛ ༉‧₊˚✧☆
🚩 ᥒ᥆ һᥲᥡ ᥴ᥆rrᥱ᥆
❛ ༉‧₊˚✧☆`,
m
)

delete conn.dropmail[id]
await conn.reply(
m.chat,
`❛ ༉‧₊˚✧☆
✅ ᥴ᥆rrᥱ᥆ ᥱᥣіmіᥒᥲძ᥆
❛ ༉‧₊˚✧☆`,
m
)
}
}

handler.help = ['dropmail']
handler.tags = ['tools']
handler.command = /^(dropmail)$/i

export default handler

function msToTime(duration) {
var seconds = Math.floor((duration / 1000) % 60)
var minutes = Math.floor((duration / (1000 * 60)) % 60)
var hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
return `${hours}h ${minutes}m ${seconds}s`
}

function formatSize(sizeInBytes) {
var units = ['B', 'KB', 'MB', 'GB', 'TB']
let index = 0
while (sizeInBytes >= 1024 && index < units.length - 1) {
sizeInBytes /= 1024
index++
}
return sizeInBytes.toFixed(2) + ' ' + units[index]
}

async function random_mail() {
const link = 'https://dropmail.me/api/graphql/web-test-wgq6m5i?query=mutation%20%7BintroduceSession%20%7Bid%2C%20expiresAt%2C%20addresses%20%7Baddress%7D%7D%7D'
const res = await fetch(link)
const data = await res.json()
return [
data.data.introduceSession.addresses[0].address,
data.data.introduceSession.id,
data.data.introduceSession.expiresAt
]
}

async function get_mails(id_) {
const link = `https://dropmail.me/api/graphql/web-test-wgq6m5i?query=query%20(%24id%3A%20ID!)%20%7Bsession(id%3A%24id)%20%7B%20mails%7BrawSize%2C%20fromAddr%2C%20toAddr%2C%20downloadUrl%2C%20text%2C%20headerSubject%7D%7D%20%7D&variables=%7B%22id%22%3A%22${id_}%22%7D`
const res = await fetch(link)
const data = await res.json()
return [data.data.session.mails, data.data.session.mails.length]
}