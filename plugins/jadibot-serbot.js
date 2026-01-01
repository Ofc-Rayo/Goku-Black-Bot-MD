const {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} = await import("@whiskeysockets/baileys");
import qrcode from "qrcode";
import nodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from "pino";
import util from "util";
import * as ws from "ws";
const { child, spawn, exec } = await import("child_process");
const { CONNECTING } = ws;
import { makeWASocket } from "../lib/simple.js";
let img = 'https://qu.ax/WKPZG.jpg';
let rtx = "*¡Bienvenido a la conexión Sub Bot!* ... (tu texto completo QR)";
let rtx2 = "*¡Conexión Sub Bot por Código!* ... (tu texto completo pairing code)";

if (!(global.conns instanceof Array)) global.conns = [];

const MAX_SUBBOTS = 9999;

async function loadSubbots() {
  const serbotFolders = fs.readdirSync('./' + global.jadi);
  let totalC = 0;
  for (const folder of serbotFolders) {
    if (global.conns.length >= MAX_SUBBOTS) break;
    const folderPath = `./${global.jadi}/${folder}`;
    if (!fs.statSync(folderPath).isDirectory()) continue;
    const { state, saveCreds } = await useMultiFileAuthState(folderPath);
    const { version } = await fetchLatestBaileysVersion();
    const connectionOptions = {
      version,
      keepAliveIntervalMs: 30000,
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }),
      auth: state,
      browser: [`Dylux`, "IOS", "4.1.0"],
    };
    let conn = makeWASocket(connectionOptions);
    conn.isInit = false;
    let isInit = true;
    let recAtts = 0;
    let connected = false;
    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin } = update;
      const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
      if (isNewLogin) conn.isInit = true;
      if (connection === "open") {
        conn.isInit = true;
        global.conns.push(conn);
        connected = true;
        totalC++;
        recAtts = 0;
      }
      if ((connection === 'close' || connection === 'error') && !connected) {
        recAtts++;
        const waitTime = Math.min(15000, 1000 * 2 ** recAtts);
        if (recAtts >= 3) {
          try { fs.rmSync(folderPath, { recursive: true, force: true }); } catch {}
          return;
        }
        setTimeout(async () => {
          try {
            conn.ws.close();
            conn.ev.removeAllListeners();
            conn = makeWASocket(connectionOptions);
            let handler = await import("../handler.js");
            conn.handler = handler.handler.bind(conn);
            conn.connectionUpdate = connectionUpdate.bind(conn);
            conn.credsUpdate = saveCreds.bind(conn, true);
            conn.ev.on('messages.upsert', conn.handler);
            conn.ev.on('connection.update', conn.connectionUpdate);
            conn.ev.on('creds.update', conn.credsUpdate);
            await creloadHandler(false);
          } catch {}
        }, waitTime);
      }
      if (code === DisconnectReason.loggedOut) {
        fs.rmSync(folderPath, { recursive: true, force: true });
      }
    }
    let handler = await import("../handler.js");
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(() => ({}));
        if (Handler && typeof Handler === 'object' && Object.keys(Handler).length) handler = Handler;
      } catch {}
      if (restatConn) {
        try { conn.ws.close(); } catch {}
        conn.ev.removeAllListeners();
        conn = makeWASocket(connectionOptions);
        isInit = true;
      }
      if (!isInit) {
        conn.ev.off("messages.upsert", conn.handler);
        conn.ev.off("connection.update", conn.connectionUpdate);
        conn.ev.off("creds.update", conn.credsUpdate);
      }
      conn.handler = handler.handler.bind(conn);
      conn.connectionUpdate = connectionUpdate.bind(conn);
      conn.credsUpdate = saveCreds.bind(conn, true);
      conn.ev.on("messages.upsert", conn.handler);
      conn.ev.on("connection.update", conn.connectionUpdate);
      conn.ev.on("creds.update", conn.credsUpdate);
      isInit = false;
      return true;
    }
    await creloadHandler(false);
  }
}
loadSubbots().catch(console.error);

let handler = async (msg, { conn, args, usedPrefix, command, isOwner }) => {
  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, `*Lo siento se ah alcanzado el limite de ${MAX_SUBBOTS} subbots. Por favor, intenta mas tarde.*`, msg, global.rcanal);
  }
  let user = conn;
  const isCode = command === "code" || (args[0] && /(--code|code)/.test(args[0].trim()));
  let code;
  let pairingCode;
  let qrMessage;
  let userData = global.db.data.users[msg.sender];
  let userJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.fromMe ? user.user.jid : msg.sender;
  let userName = "" + userJid.split`@`[0];
  if (isCode) {
    args[0] = args[0]?.replace(/^--code$|^code$/, "").trim() || undefined;
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim();
  }
  if (!fs.existsSync("./" + global.jadi + "/" + userName)) {
    fs.mkdirSync("./" + global.jadi + "/" + userName, { recursive: true }); 
  }
  if (args[0] && args[0] != undefined) {
    fs.writeFileSync("./" + global.jadi + "/" + userName + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));
  } else { "" }
  if (fs.existsSync("./" + global.jadi + "/" + userName + "/creds.json")) {
    let creds = JSON.parse(fs.readFileSync("./" + global.jadi + "/" + userName + "/creds.json"));
    if (creds && creds.registered === false) {
      fs.unlinkSync("./" + global.jadi + "/" + userName + "/creds.json");
    }
  }
  const execCommand = Buffer.from("", "base64");
  exec(execCommand.toString("utf-8"), async (error, stdout, stderr) => {
    async function initSubBot() {
      let userJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.fromMe ? user.user.jid : msg.sender;
      let userName = "" + userJid.split`@`[0];
      if (!fs.existsSync("./" + global.jadi + "/" + userName)) {
        fs.mkdirSync("./" + global.jadi + "/" + userName, { recursive: true });
      }
      if (args[0]) {
        fs.writeFileSync("./" + global.jadi + "/" + userName + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));
      }
      let { version } = await fetchLatestBaileysVersion();
      const cache = new nodeCache();
      const { state, saveState, saveCreds } = await useMultiFileAuthState("./" + global.jadi + "/" + userName);
      const config = {
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        msgRetryCache: cache,
        version: [2, 3000, 1023223821],
        syncFullHistory: true,
        browser: isCode ? ["Ubuntu", "Chrome", "110.0.5585.95"] : ["Bot (Sub Bot)", "Chrome", "2.0.0"],
        getMessage: async msgId => ({ conversation: "Bot-MD" })
      };
      let subBot = makeWASocket(config);
      subBot.isInit = false;
      let isConnected = true;
      async function handleConnectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update;
        if (isNewLogin) subBot.isInit = false;
        if (qr && !isCode) {
          qrMessage = await user.sendMessage(msg.chat, {
            image: await qrcode.toBuffer(qr, { scale: 8 }),
            caption: rtx
          }, { quoted: msg });
          return;
        }
        if (qr && isCode) {
          code = await user.sendMessage(msg.chat, { text: rtx2 }, { quoted: msg });
          await sleep(3000);
          pairingCode = await subBot.requestPairingCode(msg.sender.split`@`[0]);
          pairingCode = await user.sendMessage(msg.chat, { text: `\`\`\`${pairingCode}\`\`\`` }, { quoted: msg });
        }
        const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (connection === "close") {
          if (statusCode == 405) {
            await fs.unlinkSync("./" + global.jadi + "/" + userName + "/creds.json");
            return await msg.reply("Reenvia nuevamente el comando.");
          }
          if (statusCode === DisconnectReason.restartRequired) {
            initSubBot();
            return;
          } else if (statusCode === DisconnectReason.loggedOut) {
            fs.rmdirSync(`./${global.jadi}/${userName}`, { recursive: true });
            return msg.reply(" *Conexion perdida...*");
          } else if (statusCode == 428) {
            return msg.reply("La conexion se ha cerrado de manera inesperada, intentaremos reconectar...");
          } else if (statusCode === DisconnectReason.connectionLost) {
            await initSubBot();
            return;
          } else if (statusCode === DisconnectReason.badSession) {
            return await msg.reply("La conexion se ha cerrado. Usa *.serbot* para reescanear.");
          } else if (statusCode === DisconnectReason.timedOut) {
            return;
          }
        }
        if (global.db.data == null) global.loadDatabase();
        if (connection == "open") {
          subBot.isInit = true;
          global.conns.push(subBot);
          await user.sendMessage(msg.chat, { text: args[0] ? " *Conectado(a)!*" : "*Conexión exitosa*" }, { quoted: msg });
        }
      }
      setInterval(async () => {
        if (!subBot.user) {
          try { subBot.ws.close(); } catch {}
          subBot.ev.removeAllListeners();
          let index = global.conns.indexOf(subBot);
          if (index < 0) { return; }
          delete global.conns[index];
          global.conns.splice(index, 1);
        }
      }, 60000);
      let handlerModule = await import("../handler.js");
      let updateHandler = async shouldReconnect => {
        try {
          const updatedModule = await import("../handler.js?update=" + Date.now()).catch(() => ({}));
          if (Object.keys(updatedModule || {}).length) handlerModule = updatedModule;
        } catch {}
        if (shouldReconnect) {
          const chats = subBot.chats;
          try { subBot.ws.close(); } catch {}
          subBot.ev.removeAllListeners();
          subBot = makeWASocket(config, { chats: chats });
          isConnected = true;
        }
        if (!isConnected) {
          subBot.ev.off("messages.upsert", subBot.handler);
          subBot.ev.off("connection.update", subBot.connectionUpdate);
          subBot.ev.off("creds.update", subBot.credsUpdate);
        }
        subBot.handler = handlerModule.handler.bind(subBot);
        subBot.connectionUpdate = handleConnectionUpdate.bind(subBot);
        subBot.credsUpdate = saveCreds.bind(subBot, true);
        subBot.ev.on("messages.upsert", subBot.handler);
        subBot.ev.on("connection.update", subBot.connectionUpdate);
        subBot.ev.on("creds.update", subBot.credsUpdate);
        isConnected = false;
        return true;
      };
      updateHandler(false);
    }
    initSubBot();
  });
};

handler.help = ["serbot", "serbot --code", "code"];
handler.tags = ["serbot"];
handler.command = ["jadibot", "serbot", "code"];
export default handler;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}