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
import chalk from "chalk";
import { makeWASocket } from '../lib/simple.js';

if (!(global.conns instanceof Array)) global.conns = [];
global.jadi = 'sessions/session-sub';

const MAX_SUBBOTS = 30; // Puedes subir o bajar este valor

async function loadSubbots() {
  if (!fs.existsSync(global.jadi)) return;
  const folders = fs.readdirSync(global.jadi);
  for (const folder of folders) {
    if (global.conns.length >= MAX_SUBBOTS) {
      console.log(chalk.cyan("🌳 Límite de 30 subbots alcanzado."));
      break;
    }
    const folderPath = `${global.jadi}/${folder}`;
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const { state, saveCreds } = await useMultiFileAuthState(folderPath);
    const { version } = await fetchLatestBaileysVersion();
    const options = {
      version,
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }),
      auth: state,
      browser: ["GokuBlackBot", "Linux", "1.0.0"]
    };
    let conn = makeWASocket(options);

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin } = update;
      const code = lastDisconnect?.error?.output?.statusCode
        || lastDisconnect?.error?.output?.payload?.statusCode;
      if (isNewLogin) conn.isInit = true;
      if (connection === "open") {
        conn.isInit = true;
        global.conns.push(conn);
        console.log(chalk.blue(`🌺 Subbot ${folder} conectado exitosamente.`));
      }
      if ((connection === "close" || connection === "error") && code === DisconnectReason.loggedOut) {
        try { fs.rmSync(folderPath, { recursive: true, force: true }); } catch {}
        console.log(chalk.yellow(`Carpeta de credenciales eliminada para el subbot ${folder}.`));
      }
    }

    let handler = await import("../handler.js");
    conn.handler = handler.handler.bind(conn);
    conn.connectionUpdate = connectionUpdate.bind(conn);
    conn.credsUpdate = saveCreds.bind(conn, true);
    conn.ev.on("messages.upsert", conn.handler);
    conn.ev.on("connection.update", conn.connectionUpdate);
    conn.ev.on("creds.update", conn.credsUpdate);
  }
}
loadSubbots().catch(console.error);

let handler = async (msg, { conn, args, usedPrefix, command }) => {
  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, "*≡ Lo siento, se ha alcanzado el límite de 30 subbots. Por favor, intenta más tarde.*", msg);
  }
  let userJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.fromMe ? conn.user.jid : msg.sender;
  let userName = userJid.split`@`[0];
  let subbotPath = `${global.jadi}/${userName}`;
  if (!fs.existsSync(subbotPath)) fs.mkdirSync(subbotPath, { recursive: true });

  // soporte para código QR por credenciales base64
  if (args[0]) fs.writeFileSync(`${subbotPath}/creds.json`, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));
  if (fs.existsSync(`${subbotPath}/creds.json`)) {
    let creds = JSON.parse(fs.readFileSync(`${subbotPath}/creds.json`));
    if (creds && creds.registered === false) fs.unlinkSync(`${subbotPath}/creds.json`);
  }

  // Detección para "código de emparejamiento"
  const mcode = command === "code" || (args && args[0] && /(--code|code)/.test(args[0].trim()));
  let { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(subbotPath);
  const connectionOptions = {
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
    },
    browser: mcode
      ? ['Ubuntu', 'Chrome', '110.0.5585.95']
      : ['GokuBlack Bot', 'Chrome', '2.0.0'],
    version,
    msgRetryCounterCache: new NodeCache(),
    markOnlineOnConnect: true,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    defaultQueryTimeoutMs: undefined,
    getMessage: async () => undefined,
  };

  let subBot = makeWASocket(connectionOptions);

  async function handleConnectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    const statusCode = lastDisconnect?.error?.output?.statusCode
      || lastDisconnect?.error?.output?.payload?.statusCode;

    // QR para subbot
    if (qr && !mcode) {
      await conn.sendMessage(msg.chat, {
        image: await qrcode.toBuffer(qr, { scale: 8 }),
        caption: "≡ Escanea este código QR para conectarte como subbot.\n\n> Powered by GokuBlack",
      }, { quoted: msg });
    }
    // Pairing code modo
    if (qr && mcode) {
      await conn.sendMessage(msg.chat, { text: "≡ Usa este código de 8 dígitos en 'Vincular con número de teléfono' para unirte:\n\n> Powered by GokuBlack" }, { quoted: msg });
      setTimeout(async () => {
        let pairingCode = await subBot.requestPairingCode(msg.sender.split`@`[0]);
        await conn.sendMessage(msg.chat, { text: pairingCode }, { quoted: msg });
      }, 3000);
    }
    if (connection === "open") {
      global.conns.push(subBot);
      await conn.sendMessage(msg.chat, { text: "🌺 SubBot conectado con éxito." }, { quoted: msg });
    }
    if ((connection === "close" || connection === "error") &&
      statusCode === DisconnectReason.loggedOut) {
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
      let idx = global.conns.indexOf(subBot);
      if (idx >= 0) global.conns.splice(idx, 1);
    }
  }, 60000);
};
handler.help = ["serbot", "serbot --code", "code"];
handler.tags = ["bebot"];
handler.command = ["jadibot", "serbot", "code"];
export default handler;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}