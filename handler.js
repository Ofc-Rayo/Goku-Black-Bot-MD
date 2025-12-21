import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

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
                    premium: false,
                }
            }
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
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

        // --------- OBTENCIÓN DE METADATA Y PARTICIPANTS ---------
        let groupMetadata = {}
        let participants = []
        if (m.isGroup) {
            try {
                groupMetadata = await this.groupMetadata(m.chat)
                participants = groupMetadata.participants || []
            } catch (e) {
                groupMetadata = {}
                participants = []
            }
        }

        // --------- NUEVO BLOQUE DE DETECCIÓN DE ROLES ---------
        const sender = m.sender
        const userGroup = (m.isGroup ? participants.find((u) => this.decodeJid(u.id) === sender) : {}) || {}
        const botGroup = (m.isGroup ? participants.find((u) => this.decodeJid(u.id) == this.user.jid) : {}) || {}
        const isRAdmin = userGroup?.admin == "superadmin" || false
        const isAdmin = isRAdmin || userGroup?.admin == "admin" || false
        const isBotAdmin = botGroup?.admin || false
        const senderNum = sender.split('@')[0]
        const isROwner = [...global.owner.map(([number]) => number), this.user.jid.split('@')[0]].includes(senderNum)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum)
        let _user = global.db.data && global.db.data.users && global.db.data.users[m.chat] && global.db.data.users[m.chat][m.sender]
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum) || _user?.premium == true
        // -------------------------------------------------------

        const chat = global.db.data.chats[m.chat] || {}
        const msgHasLink = /(https?:\/\/[^\s]+)/i.test(m.text || '')
        if (
            m.isGroup &&
            chat.onlyAdmin &&
            !isAdmin &&
            !(chat.antiLink || chat.antiLinkAll)
        ) return
        if (
            m.isGroup &&
            chat.onlyAdmin &&
            !isAdmin &&
            (chat.antiLink || chat.antiLinkAll) && 
            !msgHasLink
        ) return

        const mainBot = global.conn.user.jid
        const isSubbs = chat.antiLag === true
        const allowedBots = chat.per || []
        if (!allowedBots.includes(mainBot)) allowedBots.push(mainBot)
        const isAllowed = allowedBots.includes(this.user.jid)
        if (isSubbs && !isAllowed) return

        if (opts['nyimak']) return
        if (m.isBaileys) return
        if (!m.fromMe && opts['self']) return
        if (opts['pconly'] && m.chat.endsWith('g.us')) return
        if (opts['gconly'] && !m.chat.endsWith('g.us')) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys) return
        m.exp += Math.ceil(Math.random() * 10)
        let usedPrefix

        // --- BUCLE DE PLUGINS 100% FUNCIONAL Y COMPATIBLE ---
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue
            if (plugin.disabled) continue
            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                } catch (e) { console.error(e) }
            }
            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) continue
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : global.db.data.settings[this?.user?.jid]?.noprefix
                ? "" : conn.prefix ? conn.prefix : global.prefix
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
            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user: userGroup,
                    bot: botGroup,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                })) continue
            }
            if (typeof plugin !== 'function')
                continue
            if ((usedPrefix = (match && match[0]) || (global.db.data.settings[this.user.jid]?.noprefix && ''))) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split(/\s+/)
                args = args || []
                let _args = noPrefix.trim().split(/\s+/).slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp
                    ? plugin.command.test(command)
                    : Array.isArray(plugin.command) 
                        ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command)
                        : typeof plugin.command === 'string'
                            ? plugin.command === command : false

                if (!isAccept) continue
                m.plugin = name
                if (m.chat in global.db.data.chats || m.sender in (global.db.data.users[m.chat] || {})) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.chat] && global.db.data.users[m.chat][m.sender]
                    if (name !== 'owner-unbanchat.js' && chat?.isBanned)
                        return 
                    if (name !== 'owner-unbanuser.js' && user?.banned)
                        return
                }
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { fail('owner', m, this); continue }
                if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue }
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
                if (plugin.private && m.isGroup) { fail('private', m, this); continue }
                if (plugin.register == true && _user && _user.registered == false) { fail('unreg', m, this); continue }
                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp > 200)
                    m.reply('chirrido -_-')
                else m.exp += xp
                if (!isPrems && plugin.diamond && _user && global.db.data.users[m.chat][m.sender].diamond < plugin.diamond * 1) {
                    this.reply(m.chat, `✳️ Tus diamantes se agotaron\nuse el siguiente comando para comprar más diamantes \n*buy* <cantidad> \n*buyall*`, m)
                    continue
                }
                if (_user && plugin.level > _user.level) {
                    this.reply(m.chat, `✳️ nivel requerido ${plugin.level} para usar este comando. \nTu nivel ${_user.level}`, m)
                    continue
                }
                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    user: userGroup,
                    bot: botGroup,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }
                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems)
                        m.diamond = m.diamond || plugin.diamond || false
                } catch (e) {
                    m.error = e
                    console.error(e)
                    if (e) {
                        let text = format(e)
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                        m.reply(text)
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) { console.error(e) }
                    }
                    if (m.diamond)
                        m.reply(`Utilizaste *${+m.diamond}* 💎`)
                }
                break
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && global.db.data.users[m.chat] && (user = global.db.data.users[m.chat][m.sender])) {
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
        } catch (e) {
            console.log(m, m.quoted, e)
        }
        if (opts['autoread'])
            await this.chatRead(m.chat, m.isGroup ? m.sender : undefined, m.id || m.key.id).catch(() => { })
    }
}

export async function participantsUpdate({ id, participants, action }) {
    if (opts['self'])
        return
    if (this.isInit)
        return
    if (global.db.data == null)
        await loadDatabase()
    let chat = global.db.data.chats[id] || {}
    let text = ''
    switch (action) {
        case 'add':
        case 'remove':
            if (chat.welcome) {
                let groupMetadata = await this.groupMetadata(id) || (conn.chats[id] || {}).metadata
                for (let user of participants) {
                    text = (action === 'add' ? (chat.sWelcome || this.welcome || conn.welcome || 'Bienvenido, @user').replace('@group', await this.getName(id)).replace('@desc', groupMetadata.desc?.toString() || 'Desconocido') :
                        (chat.sBye || this.bye || conn.bye || 'Adiós, @user')).replace('@user', '@' + user.split('@')[0])
                    let pp = global.db.data.settings[this.user.jid].logo || await this.profilePictureUrl(user, "image").catch(_ => global.logo || 'https://i.ibb.co/2WzLyGk/profile.jpg')
                    this.sendFile(id, action === 'add' ? pp : pp, 'pp.jpg', text, null, false, { mentions: [user] })
                }
            }
            break
        case 'promote':
        case 'demote':
            if (chat.detect) {
                text = (action === 'promote' ? (chat.sPromote || this.sPromote || conn.sPromote || '@user ahora es admin') : 
                       (chat.sDemote || this.sDemote || conn.sDemote || '@user ya no es admin')).replace('@user', '@' + participants[0].split('@')[0])
                this.sendMessage(id, { text, mentions: this.parseMention(text) })
            }
            break
    }
}

export async function groupsUpdate(groupsUpdate) {
    if (opts['self'])
        return
    for (const groupUpdate of groupsUpdate) {
        const id = groupUpdate.id
        if (!id) continue
        let chats = global.db.data.chats[id], text = ''
        if (!chats?.detect) continue
        if (groupUpdate.desc) text = (chats.sDesc || this.sDesc || conn.sDesc || 'Descripción cambiada a \n@desc').replace('@desc', groupUpdate.desc)
        if (groupUpdate.subject) text = (chats.sSubject || this.sSubject || conn.sSubject || 'El nombre del grupo cambió a \n@group').replace('@group', groupUpdate.subject)
        if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || conn.sIcon || 'El icono del grupo cambió')
        if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || conn.sRevoke || 'El enlace del grupo cambió a\n@revoke').replace('@revoke', groupUpdate.revoke)
        if (!text) continue
        await this.sendMessage(id, { text, mentions: this.parseMention(text) })
    }
}

export async function deleteUpdate(message) {
    try {
        const { fromMe, id, participant } = message
        if (fromMe)
            return
        let msg = this.serializeM(this.loadMessage(id))
        if (!msg)
            return
        let chat = global.db.data.chats[msg.chat] || {}
        if (chat.delete)
            return
        await this.reply(msg.chat, `
≡ Borró un mensaje  

 *Nombre :* @${participant.split`@`[0]} 

Para desactivar esta función, escriba 
*/off antidelete*
*.enable delete*
`.trim(), msg, {
            mentions: [participant]
        })
        this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
    } catch (e) {
        console.error(e)
    }
}

global.dfail = (type, m, conn) => {
    let msg = {
        rowner: '👑 Este comando solo puede ser utilizado por el *Creador del bot*',
        owner: '👑 Este comando solo puede ser utilizado por el *Propietario del bot*',
        mods: '🛡️ Este comando solo puede ser utilizado por *Moderadores*',
        premium: '💎 Este comando es solo para usuarios *Premium*',
        group: '👥 Este comando solo puede ser usado en *Grupos*',
        private: '🔒 Este comando solo puede ser usado en *Chat Privado*',
        admin: '👮 Este comando es solo para *Admins del grupo*',
        botAdmin: '🤖 El bot necesita ser *Admin* para usar este comando',
        unreg: '📝 Regístrate para usar este comando con */reg nombre.edad*',
        restrict: '⚠️ Esta función está deshabilitada'
        }[type]
    if (msg) return m.reply(msg)
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("✅  Se actualizo 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
}) 