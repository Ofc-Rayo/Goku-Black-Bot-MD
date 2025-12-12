import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';

global.owner = [
  ['595972157130', "ivan", true],
  ["0000"],
] 

global.mods = [] 
global.prems = []
global.APIs = {
  xteam: 'https://api.xteam.xyz', 
  nrtm: 'https://fg-nrtm.ddns.net',
  bg: 'http://bochil.ddns.net',
  fgmods: 'https://api-fgmods.ddns.net'
}
global.APIKeys = {
  'https://api.xteam.xyz': 'd90a9e986e18778b',
  'https://zenzapis.xyz': '675e34de8a', 
  'https://api-fgmods.ddns.net': 'TU-APIKEY'
}

global.prefijo = "."
global.packsticker = (nombre) => `°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°
ᰔᩚ Usuario: ${nombre}
❀ Bot: ${global.botname}
✦ Fecha: ${global.fecha}
ⴵ Hora: ${global.tiempo}`;

global.packsticker2 = `°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°

${global.dev}`

global.packname = '𝐆𝐨𝐤𝐮-𝐁𝐥𝐚𝐜𝐤-𝐁𝐨𝐭-𝐌𝐃 💥'
global.author = 'ꭈׁׅɑׁׅᨮׁׅ֮ᨵׁׅׅ'
global.wm = 'ᘜOKᑌ-ᗷᒪᗩᑕK-ᗷOT-ᗰᗪ ＼ʕ •ᴥ•ʔ／'
global.titulowm = 'ɢᴏᴋᴜ-ʙʟᴀᴄᴋ-ʙᴏᴛ-ᴍᴅ ➶➴'
global.titulowm2 = '𝙂𝙤𝙠𝙪-𝘽𝙡𝙖𝙘𝙠-𝘽𝙤𝙩-𝙈𝘿 ☉'
global.igfg = '𝘎𝘖𝘒𝘜-𝘉𝘓𝘈𝘊𝘒-𝘉𝘖𝘛-𝘔𝘋 💫'
global.botname = '𝖦𝖮𝖪𝖴-𝖡𝖫𝖠𝖢𝖪-𝖡𝖮𝖳-𝖬𝖣'
global.dev = 'Ｒａｙｏ Ｏｆｃ'
global.textbot = '𝑮𝒐𝒌𝒖-𝑩𝒍𝒂𝒄𝒌-𝑩𝒐𝒕-𝑴𝑫 ☄︎'
global.gt = '𝐺𝑜𝑘𝑢-𝐵𝑙𝑎𝑐𝑘-𝐵𝑜𝑡-𝑀𝐷 💥'
global.namechannel = 'ᥬ𝑮𝑶𝑲𝑼-𝑩𝑳𝑨𝑪𝑲-𝑩𝑶𝑻-𝑴𝑫᭄'
global.link = '';
global.logo = ''; 

global.wait = "\`Cargando . . . Espera un momento.\`"
global.rwait = '⌛'
global.dmoji = '🤭'
global.done = '✅'
global.error = '❌' 
global.xmoji = '🔥' 

global.cheerio = cheerio;
global.fs = fs;
global.fetch = fetch;
global.axios = axios;
global.moment = moment;

global.sessions = 'sessions/session-bot'
global.jadi = 'sessions/session-sub'
global.dbname = "Data/database.json"

global.d = new Date(new Date + 3600000)
global.locale = 'es'
global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
global.mes = d.toLocaleDateString('es', { month: 'long' })
global.año = d.toLocaleDateString('es', { year: 'numeric' })
global.tiempo = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })
global.botdate = `⫹⫺ Date :  ${moment.tz('America/Los_Angeles').format('DD/MM/YY')}`
global.bottime = `𝗧 𝗜 𝗠 𝗘 : ${moment.tz('America/Los_Angeles').format('HH:mm:ss')}`

global.multiplier = 250
global.maxwarn = '2'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})