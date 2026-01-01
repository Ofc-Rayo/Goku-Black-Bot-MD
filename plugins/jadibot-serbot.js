const {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} = await import("@whiskeysockets/baileys");
import qrcode from "qrcode";
import NodeCache from "node-cache";
import fs from "fs";
import pino from "pino";
import * as ws from "ws";
import { makeWASocket } from "../lib/simple.js";
const { CONNECTING } = ws;

if (!(global.conns instanceof Array)) global.conns = [];
global.jadi = 'sessions/session-sub';

const MAX_SUBBOTS = 2;

async function loadSubbots() {
  if (!fs.existsSync(global.jadi)) return;
  const serbotFolders = fs.readdirSync(global.jadi);
  for (const folder of serbotFolders) {
    const folderPath = `${global.jadi}/${folder}`;
    if (!fs.statSync(folderPath).isDirectory()) continue;
    if (global.conns.length >= MAX_SUBBOTS) break;
    try {
      const { state, saveCreds } = await useMultiFileAuthState(folderPath);
      const { version } = await fetchLatestBaileysVersion();
      const options = {
        version,
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        auth: state,
        browser: ["GokuBlackBot", "Linux", "1.0.0"],
      };
      let conn = makeWASocket(options);
      conn.isInit = false;
      let isInit = true;
      async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin } = update;
        const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (isNewLogin) conn.isInit = true;
        if (connection === "open") {
          conn.isInit = true;
          global.conns.push(conn);
        }
        if ((connection === 'close' || connection === 'error') && code === DisconnectReason.loggedOut) {
          try { fs.rmSync(folderPath, { recursive: true, force: true }); } catch {}
        }
      }
      let handler = await import("../handler.js");
      conn.handler = handler.handler.bind(conn);
      conn.connectionUpdate = connectionUpdate.bind(conn);
      conn.credsUpdate = saveCreds.bind(conn, true);
      conn.ev.on('messages.upsert', conn.handler);
      conn.ev.on('connection.update', conn.connectionUpdate);
      conn.ev.on('creds.update', conn.credsUpdate);
    } catch (e) {}
  }
}
loadSubbots().catch(() => {});

let handler = async (msg, { conn, args, usedPrefix, command }) => {
  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, `*Lo siento, se ha alcanzado el límite de ${MAX_SUBBOTS} subbots.*`, msg);
  }
  let userJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.fromMe ? conn.user.jid : msg.sender;
  let userName = userJid.split`@`[0];
  let subbotPath = `${global.jadi}/${userName}`;

  if (!fs.existsSync(subbotPath)) fs.mkdirSync(subbotPath, { recursive: true });
  if (args[0]) fs.writeFileSync(`${subbotPath}/creds.json`, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));

  if (fs.existsSync(`${subbotPath}/creds.json`)) {
    let creds = JSON.parse(fs.readFileSync(`${subbotPath}/creds.json`));
    if (creds && creds.registered === false) fs.unlinkSync(`${subbotPath}/creds.json`);
  }

  let { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(subbotPath);

  const mcode =
    command === "code" ||
    (args && (args.includes("code") || args.includes("--code") || args.includes("-code")));

  let rtx = `*Vincula el subbot usando el código QR.*`;
  let rtx2 = `*Vincula el subbot usando el código de 8 dígitos.*`;

  const connectionOptions = {
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    browser: mcode
      ? ["Ubuntu", "Chrome", "110.0.5585.95"]
      : ["GokuBlack Bot", "Chrome", "2.0.0"],
    version,
    msgRetryCounterCache: new NodeCache(),
    markOnlineOnConnect: true,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    defaultQueryTimeoutMs: undefined,
    getMessage: async () => undefined,
  };

  let subBot = makeWASocket(connectionOptions);
  subBot.isInit = false;

  async function handleConnectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    const statusCode =
      lastDisconnect?.error?.output?.statusCode ||
      lastDisconnect?.error?.output?.payload?.statusCode;

    if (isNewLogin) subBot.isInit = false;

    // QR modo normal
    if (qr && !mcode) {
      await conn.sendMessage(msg.chat, {
        image: await qrcode.toBuffer(qr, { scale: 8 }),
        caption: rtx,
      }, { quoted: msg });
    }

    // QR con código de 8 dígitos (pairing code)
    if (qr && mcode) {
      await conn.sendMessage(msg.chat, { text: rtx2 }, { quoted: msg });
      setTimeout(async () => {
        let pairingCode = await subBot.requestPairingCode(msg.sender.split`@`[0]);
        await conn.sendMessage(msg.chat, { text: `${pairingCode}` }, { quoted: msg });
      }, 3000);
    }

    if (connection === "open") {
      subBot.isInit = true;
      global.conns.push(subBot);
      await conn.sendMessage(msg.chat, { text: "SubBot conectado con éxito" }, { quoted: msg });
    }

    if ((connection === "close" || connection === "error") && statusCode === DisconnectReason.loggedOut) {
      fs.rmSync(subbotPath, { recursive: true, force: true });
    }
  }

  let handlerModule = await import("../handler.js");
  subBot.handler = handlerModule.handler.bind(subBot);
  subBot.connectionUpdate = handleConnectionUpdate.bind(subBot);
  subBot.credsUpdate = saveCreds.bind(subBot, true);
  subBot.ev.on("messages.upsert", subBot.handler);
  subBot.ev.on("connection.update", subBot.connectionUpdate);
  subBot.ev.on("creds.update", subBot.credsUpdate);

  setInterval(() => {
    if (!subBot.user) {
      try { subBot.ws.close(); } catch {}
      subBot.ev.removeAllListeners();
      let index = global.conns.indexOf(subBot);
      if (index >= 0) global.conns.splice(index, 1);
    }
  }, 60000);
};

handler.help = ["serbot", "serbot --code", "code"];
handler.tags = ["serbot"];
handler.command = ["jadibot", "serbot", "code"];
export default handler;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}