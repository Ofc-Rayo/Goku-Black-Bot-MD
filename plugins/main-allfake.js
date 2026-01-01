import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) {
    try {
        global.getBuffer = async function getBuffer(url, options) {
            try {
                options = options || {}
                const res = await axios({
                    method: "get",
                    url,
                    headers: {
                        'DNT': 1,
                        'User-Agent': 'GoogleBot',
                        'Upgrade-Insecure-Request': 1
                    },
                    ...options,
                    responseType: 'arraybuffer'
                })
                return res.data
            } catch (e) {
                return null
            }
        }

        global.creador = 'Wa.me/59597215130'
        global.ofcbot = `${conn.user.jid.split('@')[0]}`
        global.namechannel = 'g᥆kᥙ-ᑲᥣᥲᥴk-ᑲ᥆𝗍-mძ - ᥙ⍴ძᥲ𝗍ᥱs 💫'
        global.namechannel2 = '=͟͟͞g᥆kᥙ-ᑲᥣᥲᥴk-ᑲ᥆𝗍-mძ - ᥴһᥲᥒᥒᥱᥣ⏤͟͟͞͞★'
        global.namegrupo = 'ᰔᩚ g᥆kᥙ-ᑲᥣᥲᥴk-ᑲ᥆𝗍-mძ • ᥆𝖿іᥴіᥲᥣ ❀'
        global.namecomu = 'ᰔᩚ g᥆kᥙ-ᑲᥣᥲᥴk-ᑲ᥆𝗍-mძ • ᥴ᥆mᥙᥒі𝗍ᥡ ❀'
        global.listo = '❀ *Aquí tienes ฅ^•ﻌ•^ฅ*'

        global.fotoperfil = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://sylphy.xyz/download/XYmJwC.jpeg')

        global.canalIdM = ["120363276986902836@newsletter", "120363276986902836@newsletter"]
        global.canalNombreM = ["g᥆kᥙ-ᑲᥣᥲᥴk-ᑲ᥆𝗍-mძ - ᥙ⍴ძᥲ𝗍ᥱs 💫", "g᥆kᥙ-ᑲᥣᥲᥴk-ᑲ᥆𝗍-mძ - ᥴһᥲᥒᥒᥱᥣ 💥"]
        global.channelRD = await getRandomChannel()

        global.d = new Date(new Date().getTime() + 3600000)
        global.locale = 'es'
        global.dia = d.toLocaleDateString(locale, {weekday: 'long'})
        global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'})
        global.mes = d.toLocaleDateString('es', {month: 'long'})
        global.año = d.toLocaleDateString('es', {year: 'numeric'})
        global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})

        global.rwait = '🕒'
        global.done = '✅'
        global.error = '✖️'
        global.msm = '⚠︎'

        global.emoji = '❀'
        global.emoji2 = '✧'
        global.emoji3 = '✦'
        global.emoji4 = '❍'
        global.emoji5 = '✰'
        global.emojis = [emoji, emoji2, emoji3, emoji4].getRandom()

        global.wait = '❍ Espera un momento, soy lento...'
        global.waitt = '❍ Espera un momento, soy lento...'
        global.waittt = '❍ Espera un momento, soy lento...'
        global.waitttt = '❍ Espera un momento, soy lento...'

        const canal = ''  
        const comunidad = ''
        const git = 'https://github.com/Dev-Rayo'
        const github = 'https://github.com/Dev-Rayo/Goku-Black-Bot-MD'
        const correo = ''
        global.redes = [canal, comunidad, git, github, correo].getRandom()

        const category = "imagen"
        const db = './goku/datos/db.json'
        let rimg = null

        try {
            if (fs.existsSync(db)) {
                const db_ = JSON.parse(fs.readFileSync(db))
                if (db_.links && db_.links[category] && db_.links[category].length > 0) {
                    const random = Math.floor(Math.random() * db_.links[category].length)
                    const randomlink = db_.links[category][random]
                    const response = await fetch(randomlink)
                    rimg = await response.buffer()
                }
            }
        } catch (e) {}

        global.icons = rimg || 'https://sylphy.xyz/download/XYmJwC.jpeg'

        const ase = new Date()
        const hour = ase.getHours()

        if (hour >= 0 && hour < 3) {
            global.saludo = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
        } else if (hour >= 3 && hour < 10) {
            global.saludo = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'
        } else if (hour >= 10 && hour < 14) {
            global.saludo = 'Lɪɴᴅᴏ Dɪᴀ 🌤'
        } else if (hour >= 14 && hour < 18) {
            global.saludo = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'
        } else {
            global.saludo = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
        }

        global.nombre = m.pushName || 'Anónimo'
        global.taguser = '@' + m.sender.split("@")[0]
        const more = String.fromCharCode(8206)
        global.readMore = more.repeat(850)

        global.fkontak = { 
            key: {
                participant: `0@s.whatsapp.net`, 
                ...(m.chat ? { remoteJid: `6285600793871-1614953337@g.us` } : {})
            }, 
            message: { 
                'contactMessage': { 
                    'displayName': `${nombre}`, 
                    'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${nombre},;;;\nFN:${nombre},\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 
                    'jpegThumbnail': null, 
                    thumbnail: null,
                    sendEphemeral: true
                }
            }
        }

        global.fake = { 
            contextInfo: { 
                isForwarded: true, 
                forwardedNewsletterMessageInfo: { 
                    newsletterJid: channelRD.id, 
                    newsletterName: channelRD.name, 
                    serverMessageId: -1 
                }
            }
        }
        global.icono = [
            'https://sylphy.xyz/download/XYmJwC.jpeg',
        ].getRandom()
        global.rcanal = { 
            contextInfo: { 
                isForwarded: true, 
                forwardedNewsletterMessageInfo: { 
                    newsletterJid: channelRD.id, 
                    serverMessageId: 100, 
                    newsletterName: channelRD.name
                }, 
                externalAdReply: { 
                    showAdAttribution: true, 
                    title: global.packname || 'Goku Black Bot', 
                    body: global.dev || 'Dev Rayo', 
                    mediaUrl: null, 
                    description: null, 
                    previewType: "PHOTO", 
                    thumbnailUrl: icono, 
                    sourceUrl: redes, 
                    mediaType: 1, 
                    renderLargerThumbnail: false 
                }
            }
        }
    } catch (e) {}
}

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
    try {
        const randomIndex = Math.floor(Math.random() * global.canalIdM.length)
        const id = global.canalIdM[randomIndex]
        const name = global.canalNombreM[randomIndex]
        return { id, name }
    } catch (e) {
        return { 
            id: "120363276986902836@newsletter", 
            name: "g᥆kᥙ-ᑲᥣᥲᥴk-ᑲ᥆𝗍-mძ - ᥙ⍴ძᥲ𝗍ᥱs 💫" 
        }
    }
}

if (!Array.prototype.getRandom) {
    Array.prototype.getRandom = function() {
        return this[Math.floor(Math.random() * this.length)]
    }
}