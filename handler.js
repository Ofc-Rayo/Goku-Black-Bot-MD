import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m) return
        m.exp = 0
        m.diamond = false
        try {
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
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('isBanned' in chat)) chat.isBanned = false
                if (!('welcome' in chat)) chat.welcome = false
                if (!('detect' in chat)) chat.detect = false
                if (!('sWelcome' in chat)) chat.sWelcome = ''
                if (!('sBye' in chat)) chat.sBye = ''
                if (!('sPromote' in chat)) chat.sPromote = ''
                if (!('sDemote' in chat)) chat.sDemote = ''
                if (!('delete' in chat)) chat.delete = true
                if (!('antiLink' in chat)) chat.antiLink = false
                if (!('antiLinkAll' in chat)) chat.antiLinkAll = false
                if (!('viewonce' in chat)) chat.viewonce = false
                if (!('onlyAdmin' in chat)) chat.onlyAdmin = false
                if (!('nsfw' in chat)) chat.nsfw = false
                if (!('antiLag' in chat)) chat.antiLag = false
                if (!('per' in chat)) chat.per = []
                if (!isNumber(chat.expired)) chat.expired = 0
            } else {
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    antiLag: false,
                    per: [],
                    welcome: false,
                    detect: false,
                    sWelcome: '',
                    sBye: '',
                    sPromote: '',
                    sDemote: '',
                    delete: true,
                    antiLink: false,
                    antiLinkAll: false,
                    viewonce: false,
                    useDocument: true,
                    onlyAdmin: false,
                    nsfw: false, 
                    expired: 0,
                }
            }
            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('autoread' in settings)) settings.autoread = false
                if (!('restrict' in settings)) settings.restrict = false
                if (!('actives' in settings)) settings.actives = []
                if (!('status' in settings)) settings.status = 0
                if (!('noprefix' in settings)) settings.noprefix = false
                if (!('logo' in settings)) settings.logo = null
            } else global.db.data.settings[this.user.jid] = {
                self: false,
                autoread: false,
                restrict: false, 
                actives: [],
                status: 0,
                noprefix: false,
                logo: "",
            }
        } catch (e) {
            console.error(e)
        }

        const chat = global.db.data.chats[m.chat] || {}
        const gpmt = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
        const parts = (m.isGroup ? gpmt.participants : []) || []
        const sender = m.sender.replace(/[^0-9]/g, '')
        const usr = m.isGroup ? parts.find(u => u.id.replace(/[^0-9]/g, '') === sender) : {}
        const isRA = usr?.admin === 'superadmin'
        const isA = isRA || usr?.admin === 'admin'

        const msgHasLink = /(https?:\/\/[^\s]+)/i.test(m.text || '')
        if (m.isGroup && chat.onlyAdmin && !isA && !(chat.antiLink || chat.antiLinkAll)) return
        if (m.isGroup && chat.onlyAdmin && !isA && (chat.antiLink || chat.antiLinkAll) && !msgHasLink) return

        const mainBot = global.conn.user.jid
        const isSubbs = chat.antiLag === true
        const allowedBots = chat.per || []
        if (!allowedBots.includes(mainBot)) allowedBots.push(mainBot)
        const isAllowed = allowedBots.includes(this.user.jid)
        if (isSubbs && !isAllowed) return

        if (opts['nyimak'] || m.isBaileys || (!m.fromMe && opts['self'])) return
        if ((opts['pconly'] && m.chat.endsWith('g.us')) || (opts['gconly'] && !m.chat.endsWith('g.us'))) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''

        const sendNum = m.sender.replace(/[^0-9]/g, '')
        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)]
            .map(v => v.replace(/[^0-9]/g, ''))
            .includes(sendNum)
        const isOwner = isROwner
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        m.exp += Math.ceil(Math.random() * 10)

        // Loop de plugins robusto
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in (global.plugins || {})) {
            let plugin = global.plugins[name]
            if (!plugin || typeof plugin !== 'object') continue
            if (plugin.disabled) continue
            const __filename = join(___dirname, name)
            // plugin.all
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
                } catch (e) {
                    console.error(e)
                }
            }
            // Comando principal
            let _pluginFunc = typeof plugin.default === 'function' ? plugin.default : plugin
            if (typeof _pluginFunc !== 'function') continue
            let _prefix = plugin.customPrefix ? plugin.customPrefix : global.db.data.settings[this?.user?.jid]?.noprefix ? "" : conn.prefix ? conn.prefix : global.prefix
            let str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let match = (_prefix instanceof RegExp ?
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ?
                    _prefix.map(p => {
                        let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1])
            if (!match || !match[0]) continue
            let noPrefix = m.text.replace(match[0], '')
            let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
            args = args || []
            let _args = noPrefix.trim().split` `.slice(1)
            let text = _args.join` `
            command = (command || '').toLowerCase()
            let fail = plugin.fail || global.dfail
            let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                typeof plugin.command === 'string' ? plugin.command === command : false
            if (!isAccept) continue
            m.plugin = name
            // Revisar baneos y restricciones
            if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                let chat = global.db.data.chats[m.chat]
                let user = global.db.data.users[m.chat][m.sender]
                if (name != 'owner-unbanchat.js' && chat?.isBanned) return
                if (name != 'owner-unbanuser.js' && user?.banned) return
            }
            if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
                fail('owner', m, this)
                continue
            }
            if (plugin.rowner && !isROwner) {
                fail('rowner', m, this)
                continue
            }
            if (plugin.owner && !isOwner) {
                fail('owner', m, this)
                continue
            }
            if (plugin.mods && !isMods) {
                fail('mods', m, this)
                continue
            }
            if (plugin.premium && !isPrems) {
                fail('premium', m, this)
                continue
            }
            if (plugin.group && !m.isGroup) {
                fail('group', m, this)
                continue
            } else if (plugin.botAdmin && !(parts.find(u => u.id === this.user.jid)?.admin)) {
                fail('botAdmin', m, this)
                continue
            } else if (plugin.admin && !isA) {
                fail('admin', m, this)
                continue
            }
            if (plugin.private && m.isGroup) {
                fail('private', m, this)
                continue
            }
            if (plugin.register == true && user.registered == false) {
                fail('unreg', m, this)
                continue
            }
            m.isCommand = true
            let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
            m.exp += xp
            if (!isPrems && plugin.diamond && global.db.data.users[m.chat][m.sender].diamond < plugin.diamond * 1) {
                this.reply(m.chat, `✳️ Tus diamantes se agotaron\nuse el siguiente comando para comprar más diamantes \n*buy* <cantidad> \n*buyall*`, m)
                continue
            }
            if (plugin.level > user.level) {
                this.reply(m.chat, `✳️ Nivel requerido ${plugin.level} para usar este comando. \nTu nivel ${user.level}`, m)
                continue
            }
            let extra = {
                match,
                usedPrefix: match[0],
                noPrefix,
                _args,
                args,
                command,
                text,
                conn: this,
                participants: parts,
                groupMetadata: gpmt,
                user: usr,
                isROwner,
                isOwner,
                isRA,
                isA,
                isPrems,
                chatUpdate,
                __dirname: ___dirname,
                __filename
            }
            try {
                await _pluginFunc.call(this, m, extra)
                if (!isPrems) m.diamond = m.diamond || plugin.diamond || false
            } catch (e) {
                m.error = e
                console.error(e)
                if (e) {
                    let text = format(e)
                    for (let key of Object.values(global.APIKeys || {}))
                        text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                    m.reply(text)
                }
            } finally {
                if (typeof plugin.after === 'function') {
                    try {
                        await plugin.after.call(this, m, extra)
                    } catch (e) { console.error(e) }
                }
                if (m.diamond) m.reply(`Utilizaste *${+m.diamond}* 💎`)
            }
            break
        }

    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
        }
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && (user = global.db.data.users[m.chat][m.sender])) {
                user.exp += m.exp
                user.diamond -= m.diamond * 1
            }
            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total)) stat.total = 1
                    if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last)) stat.last = now
                    if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
                } else stat = stats[m.plugin] = {
                    total: 1,
                    success: m.error != null ? 0 : 1,
                    last: now,
                    lastSuccess: m.error != null ? 0 : now
                }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }
        try {
            if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
        } catch (e) { }
        if (opts['autoread'])
            await this.chatRead(m.chat, m.isGroup ? m.sender : undefined, m.id || m.key.id).catch(() => { })
    }
}

global.dfail = (type, m, conn) => {
    let msg = {
        rowner: '👑 Este comando solo puede ser utilizado por el *Creador del bot*',
        owner: '🔱 Este comando solo puede ser utilizado por el *Dueño del Bot*',
        mods: '🔰 Esta función es solo para *Moderadores del Bot*',
        premium: '💠 Este comando es solo para miembros *Premium*',
        group: '⚙️ ¡Este comando solo se puede usar en grupos!',
        private: '📮 Este comando solo se puede usar en el chat *privado del Bot*',
        admin: '🛡️ Este comando es solo para *Admins* del grupo',
        botAdmin: '💥 ¡Para usar este comando debo ser *Administrador!*',
        unreg: '📇 Regístrate utilizando */reg nombre.edad*',
        restrict: '🔐 Esta característica está *deshabilitada*'
    }[type]
    if (msg) return m.reply(msg)
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta('✅ Se actualizó handler.js'))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})