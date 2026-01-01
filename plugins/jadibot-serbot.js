const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    MessageRetryMap,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    PHONENUMBER_MCC
} = await import('@whiskeysockets/baileys')
import NodeCache from 'node-cache'
import readline from 'readline'
import qrcode from "qrcode"
import crypto from 'crypto'
import fs from "fs"
import pino from 'pino'
import * as ws from 'ws'
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'

if (!Array.isArray(global.conns)) global.conns = []

global.sessions = 'sessions/session-bot'
global.jadi = 'sessions/session-sub'

let handler = async (m, { conn: _conn, args, usedPrefix, command, isOwner }) => {
    let parent = args[0] && args[0] == 'plz' ? _conn : await global.conn
    if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == _conn.user.jid)) {
        throw `📌 Solo puedes usar esto desde el bot principal.`
    }

    async function bbts() {
        let authFolderB = crypto.randomBytes(10).toString('hex').slice(0, 8)
        let sessionPath = `${global.jadi}/${authFolderB}`

        if (!fs.existsSync(sessionPath)){
            fs.mkdirSync(sessionPath, { recursive: true })
        }
        if (args[0]) {
            fs.writeFileSync(
                `${sessionPath}/creds.json`,
                JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')
            )
        }

        // Límite de 5 subbots
        const MAX_SUBBOTS = 5
        const activeConns = global.conns.filter(c => c.user && c.ws?.socket && c.ws.socket.readyState !== ws.CLOSED)
        if (activeConns.length >= MAX_SUBBOTS) {
            return m.reply(`*Lo siento, sólo pueden haber ${MAX_SUBBOTS} subbots conectados al mismo tiempo.*`)
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
        const msgRetryCounterCache = new NodeCache()
        const { version } = await fetchLatestBaileysVersion()
        let phoneNumber = m.sender.split('@')[0]

        const methodCodeQR = process.argv.includes("qr")
        const methodCode = !!phoneNumber || process.argv.includes("code")
        const MethodMobile = process.argv.includes("mobile")

        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

        const connectionOptions = {
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            mobile: MethodMobile,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            getMessage: async (clave) => {
                let jid = jidNormalizedUser(clave.remoteJid)
                let msg = await store.loadMessage(jid, clave.id)
                return msg?.message || ""
            },
            msgRetryCounterCache,
            msgRetryCounterMap: MessageRetryMap,
            defaultQueryTimeoutMs: undefined,
            version
        }

        let conn = makeWASocket(connectionOptions)

        if (methodCode && !conn.authState.creds.registered) {
            if (!phoneNumber) process.exit(0)
            let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '')
            if (!Object.keys(PHONENUMBER_MCC).some(v => cleanedNumber.startsWith(v))) process.exit(0)

            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(cleanedNumber)
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
                parent.sendFile(m.chat, 'https://i.ibb.co/SKKdvRb/code.jpg', 'qrcode.png', `➤ Code: *${codeBot}*`, m)
                rl.close()
            }, 3000)
        }

        conn.isInit = false
        let isInit = true

        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin, qr } = update
            if (isNewLogin) conn.isInit = true

            const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
            if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
                let i = global.conns.indexOf(conn)
                if (i < 0) return
                delete global.conns[i]
                global.conns.splice(i, 1)
            }

            if (global.db.data == null) loadDatabase()

            if (connection == 'open') {
                conn.isInit = true
                global.conns.push(conn)
                await parent.sendMessage(m.chat, { text: `✅ Subbot conectado con éxito.` }, { quoted: m })
                await parent.sendMessage(conn.user.jid, { text: `✅ ¡Subbot listo!` }, { quoted: m })
                parent.sendMessage(conn.user.jid, { text: usedPrefix + command + " " + Buffer.from(fs.readFileSync(`${sessionPath}/creds.json`), "utf-8").toString("base64") }, { quoted: m })
            }
        }

        setInterval(async () => {
            if (!conn.user) {
                try { conn.ws.close() } catch { }
                conn.ev.removeAllListeners()
                let i = global.conns.indexOf(conn)
                if (i < 0) return
                delete global.conns[i]
                global.conns.splice(i, 1)
            }
        }, 60000)

        let handlerModule = await import('../handler.js')
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
                if (Handler && typeof Handler === 'object' && Object.keys(Handler).length) handlerModule = Handler
            } catch (e) {
                console.error(e)
            }
            if (restatConn) {
                try { conn.ws.close() } catch { }
                conn.ev.removeAllListeners()
                conn = makeWASocket(connectionOptions)
                isInit = true
            }

            if (!isInit) {
                conn.ev.off('messages.upsert', conn.handler)
                conn.ev.off('group-participants.update', conn.participantsUpdate)
                conn.ev.off('groups.update', conn.groupsUpdate)
                conn.ev.off('call', conn.onCall)
                conn.ev.off('connection.update', conn.connectionUpdate)
                conn.ev.off('creds.update', conn.credsUpdate)
            }

            conn.handler = handlerModule.handler.bind(conn)
            conn.participantsUpdate = handlerModule.participantsUpdate.bind(conn)
            conn.groupsUpdate = handlerModule.groupsUpdate.bind(conn)
            conn.connectionUpdate = connectionUpdate.bind(conn)
            conn.credsUpdate = saveCreds.bind(conn, true)

            conn.ev.on('messages.upsert', conn.handler)
            conn.ev.on('group-participants.update', conn.participantsUpdate)
            conn.ev.on('groups.update', conn.groupsUpdate)
            conn.ev.on('connection.update', conn.connectionUpdate)
            conn.ev.on('creds.update', conn.credsUpdate)
            isInit = false
            return true
        }
        creloadHandler(false)
    }
    bbts()
}

handler.help = ['jadibot']
handler.tags = ['jadibot']
handler.command = ['code', 'serbot', 'jadibot', 'botclone', 'clonebot']
handler.rowner = false

export default handler

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}