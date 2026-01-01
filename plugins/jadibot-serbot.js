import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import ws from "ws"
import { exec } from "child_process"
import { makeWASocket } from "../lib/simple.js"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!(globalThis.conns instanceof Array)) globalThis.conns = []

let commandFlags = {}
const activeConnections = new Set()
const failedBots = new Map()

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let who = m?.mentionedJid?.[0] || m?.sender
    if (!who) return
    let id = who.split("@")[0]
    let pathBotJadiBot = path.join(`./${global.jadi}/`, id)
    fs.mkdirSync(pathBotJadiBot, { recursive: true })

    botJadiBot({
        pathBotJadiBot,
        m,
        conn,
        args,
        usedPrefix,
        command,
        fromCommand: true
    })
}

handler.command = ["qr", "code"]
export default handler

const rtxQR = `╭━━━━━━━━━━━━━━━━╮
│  *SUB BOT - SERBOT* 
├━━━━━━━━━━━━━━━━┤
│ Escanea este QR para ser un Sub Bot
├━━━━━━━━━━━━━━━━┤
│  *Pasos para escanear:*
│ 1 : WhatsApp → ⋮
│ 2 : Dispositivos vinculados
│ 3 : Escanear este QR
├━━━━━━━━━━━━━━━━┤
│ ⚠️ Código expira en 30 segundos
╰━━━━━━━━━━━━━━━━╯`

const rtxCode = `╭━━━━━━━━━━━━━━━━╮
│  *SUB BOT - SERBOT* 
├━━━━━━━━━━━━━━━━┤
│ Usa este Código para convertirte en un Sub Bot
├━━━━━━━━━━━━━━━━┤
│  *Pasos:*
│ 1 : WhatsApp → ⋮
│ 2 : Dispositivos vinculados
│ 3 : Vincular con número
│ 4 : Ingresar el código
├━━━━━━━━━━━━━━━━┤
│ ⚠️ Solo funciona en el número que lo solicitó
╰━━━━━━━━━━━━━━━━╯`

export async function botJadiBot(options, text = "") {
    let { pathBotJadiBot, m, conn, args, usedPrefix, command } = options

    if (!m) {
        m = {
            sender: path.basename(pathBotJadiBot) + "@s.whatsapp.net",
            chat: null
        }
    }

    if (command === "code") {
        command = "qr"
        args.unshift("code")
    }

    const mcode = args?.some(v => /code|--code/.test(v))
    const credsPath = path.join(pathBotJadiBot, "creds.json")
    fs.mkdirSync(pathBotJadiBot, { recursive: true })

    try {
        if (args?.[0]) {
            fs.writeFileSync(
                credsPath,
                JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString()), null, 2)
            )
        }
    } catch {}

    let { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathBotJadiBot)

    const sock = makeWASocket({
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        browser: ["Windows", "Chrome"],
        version,
        msgRetry: () => false,
        msgRetryCache
    })

    let isInit = true
    if (m?.sender) commandFlags[m.sender] = true

    async function connectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update

        if (qr && m?.chat && !mcode) {
            const img = await qrcode.toBuffer(qr, { scale: 8 })
            await conn.sendMessage(m.chat, { image: img, caption: rtxQR })
        }

        if (qr && m?.chat && mcode) {
            let secret = await sock.requestPairingCode(m.sender.split("@")[0])
            secret = secret.match(/.{1,4}/g)?.join("-")
            await conn.sendMessage(m.chat, { text: rtxCode })
            await conn.sendMessage(m.chat, { text: `Code: ${secret}` })
        }

        if (connection === "open") {
            globalThis.conns.push(sock)
            if (m?.chat && commandFlags[m.sender]) {
                await conn.sendMessage(m.chat, { text: "Sub-bot conectado correctamente." })
                delete commandFlags[m.sender]
            }
            console.log(chalk.green(`+${sock.user?.jid?.split("@")[0]} Conectado`))
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode
            if ([428, 408, 515].includes(reason)) {
                await reload(true)
            }
            if ([401, 403, 440].includes(reason)) {
                fs.rmSync(pathBotJadiBot, { recursive: true, force: true })
            }
        }
    }

    async function reload(restart) {
        if (restart) {
            try { sock.ws.close() } catch {}
        }
        sock.ev.removeAllListeners()
        sock.ev.on("connection.update", connectionUpdate)
        sock.ev.on("creds.update", saveCreds)
        isInit = false
    }

    await reload(false)
}

async function checkSubBots() {
    const base = path.resolve(`./${global.jadi}`)
    if (!fs.existsSync(base)) return

    for (const folder of fs.readdirSync(base)) {
        const botPath = path.join(base, folder)
        if (!fs.existsSync(path.join(botPath, "creds.json"))) continue
        if (activeConnections.has(folder)) continue

        activeConnections.add(folder)
        try {
            await botJadiBot({
                pathBotJadiBot: botPath,
                m: null,
                conn: globalThis.conn,
                args: [],
                usedPrefix: "#",
                command: "jadibot",
                fromCommand: false
            })
        } catch {}
        setTimeout(() => activeConnections.delete(folder), 30000)
    }
}

setInterval(checkSubBots, 60000)

async function joinChannels(conn) {
    if (!global.channel || typeof global.channel !== "object") return
    for (const id of Object.values(global.channel)) {
        await conn.newsletterFollow(id).catch(() => {})
    }
}