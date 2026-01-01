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
global.sessions = 'sessions/session-bot';
global.jadi = 'sessions/session-sub';

const MAX_SUBBOTS = 9999; // Cambia si quieres menos

async function loadSubbots() {
  if (!fs.existsSync('./' + global.jadi)) return;
  const serbotFolders = fs.readdirSync('./' + global.jadi);
  for (const folder of serbotFolders) {
    const folderPath = `./${global.jadi}/${folder}`;
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
        browser: [`GokuBlackBot`, "Linux", "1.0.0"],
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
    } catch (e) { }
  }
}
loadSubbots().catch(() => {});

let handler = async (msg, { conn, args, usedPrefix, command }) => {
  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, `*Lo siento se ah alcanzado el limite de ${MAX_SUBBOTS} subbots. Por favor, intenta mas tarde.*`, msg);
  }
  let userJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.fromMe ? conn.user.jid : msg.sender;
  let userName = "" + userJid.split`@`[0];
  let subbotPath = `./${global.jadi}/${userName}`;
  
  if (!fs.existsSync(subbotPath)) fs.mkdirSync(subbotPath, { recursive: true });
  if (args[0]) fs.writeFileSync(`${subbotPath}/creds.json`, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));

  if (fs.existsSync(`${subbotPath}/creds.json`)) {
    let creds = JSON.parse(fs.readFileSync(`${subbotPath}/creds.json`));
    if (creds && creds.registered === false) {
      fs.unlinkSync(`${subbotPath}/creds.json`);
    }
  }
  
  let { version } = await fetchLatestBaileysVersion();
  const msgRetryCache = new NodeCache();
  const { state, saveCreds } = await useMultiFileAuthState(subbotPath);
  const config = {
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
    },
    browser: ["GokuBlackBot-MD", "Chrome", "2.0.0"],
    msgRetryCache,
    version
  };
  let subBot = makeWASocket(config);
  subBot.isInit = false;

  async function handleConnectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    if (isNewLogin) subBot.isInit = false;
    if (qr) {
      await conn.sendMessage(msg.chat, {
        image: await qrcode.toBuffer(qr, { scale: 8 }),
        caption: "*¡Escanea este QR para vincular tu subbot!*",
      }, { quoted: msg });
    }
    if (connection === "open") {
      subBot.isInit = true;
      global.conns.push(subBot);
      await conn.sendMessage(msg.chat, { text: "✅ ¡SubBot conectado con éxito!" }, { quoted: msg });
    }
    if ((connection === 'close' || connection === 'error') && statusCode === DisconnectReason.loggedOut) {
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

  setInterval(async () => {
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
  return new Promise(resolve => setTimeout(resolve, ms));
}