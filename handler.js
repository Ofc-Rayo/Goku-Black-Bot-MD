import fs from 'fs'
import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const { proto } = (await import('@whiskeysockets/baileys')).default

// Prefix global del bot (ajusta si usas otro)
global.prefix = '.'

// Loader universal de plugins
global.plugins = {}
const pluginFolder = './plugins'
for (const file of fs.readdirSync(pluginFolder)) {
    if (!file.endsWith('.js')) continue
    let plugin = await import(`file://${process.cwd()}/${pluginFolder}/${file}?update=${Date.now()}`)
    global.plugins[file] = plugin.default ? plugin.default : plugin
}

console.log('🟢 Plugins cargados:', Object.keys(global.plugins))

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()

    // Mensaje preprocesado (simple.js)
    m = smsg(this, m) || m
    if (!m) return
    m.exp = 0
    m.diamond = false

    // Setup mínimo de usuario (ajusta si tu DB necesita otros campos)
    global.db.data.users[m.chat] = global.db.data.users[m.chat] || {}
    let user = global.db.data.users[m.chat][m.sender]
    if (typeof user !== 'object') {
        user = global.db.data.users[m.chat][m.sender] = {
            exp: 0,
            diamond: 10,
            coin: 50,
            lastmiming: 0,
            lastclaim: 0,
            registered: false,
            name: m.name,
            age: -1,
            regTime: -1,
            afk: -1,
            afkReason: '',
            banned: false,
            warn: 0,
            level: 0,
            role: 'Novato',
            autolevelup: false,
            chatbot: false,
        }
    }
    // Chat dummy minimal
    let chat = global.db.data.chats[m.chat]
    if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}

    // Extra: aquí puedes cargar metadata, admin, etc...

    // Bucle robusto de plugins
    for (let name in (global.plugins || {})) {
        let plugin = global.plugins[name]
        if (!plugin || typeof plugin !== 'object') continue
        if (plugin.disabled) continue
        let _pluginFunc = typeof plugin.default === 'function' ? plugin.default : plugin
        if (typeof _pluginFunc !== 'function') continue

        // Prefix detection
        let prefixes = Array.isArray(global.prefix) ? global.prefix : [global.prefix]
        let usedPrefix = prefixes.find(p => m.text && m.text.startsWith(p))
        if (!usedPrefix) continue

        let text = m.text.slice(usedPrefix.length).trim()
        let [command, ...args] = text.split(/\s+/)
        command = (command || "").toLowerCase()
        m.command = command
        m.args = args
        m.prefix = usedPrefix
        m.textNoPrefix = text

        // Comando válido según handler.command
        let triggered = plugin.command instanceof RegExp
            ? plugin.command.test(command)
            : Array.isArray(plugin.command)
                ? plugin.command.includes(command)
                : plugin.command === command

        if (!triggered) continue

        // Ejecuta el handler
        try {
            await _pluginFunc.call(this, m, { conn: this, args, text: args.join(" ") })
        } catch (e) {
            console.error(`[PLUGIN][${name}] ERROR:`, e)
            m.reply('💥 Error interno al ejecutar el comando.')
        }
        break // solo ejecuta el primer match
    }
}

global.dfail = (type, m, conn) => {
    let msg = {
        rowner: '👑 Solo para el Creador del bot',
        owner: '🔱 Solo para el Dueño del Bot',
        mods: '🔰 Solo para Moderadores',
        premium: '💠 Sólo miembros Premium',
        group: '⚙️ Solo válido en grupos',
        private: '📮 Solo válido en privado',
        admin: '🛡️ Solo para Admins del grupo',
        botAdmin: '💥 Debo ser administrador',
        unreg: '📇 Regístrate con /reg nombre.edad',
        restrict: '🔐 Esta función está deshabilitada'
    }[type]
    if (msg) return m.reply(msg)
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta('✅ Se actualizó handler.js'))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})