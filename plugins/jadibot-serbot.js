
const {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} = await import("@whiskeysockets/baileys");
import _0xe1604d from 'qrcode';
import _0x3378da from 'node-cache';
import _0x20893d from 'fs';
import 'path';
import _0x22c219 from 'pino';
import 'util';
import * as _0x3d7f01 from 'ws';
const {
  child,
  spawn,
  exec
} = await import("child_process");
import _0xbb23f3 from 'chalk';
import { makeWASocket } from '../lib/simple.js';
if (global.conns instanceof Array) {
  console.log();
} else {
  global.conns = [];
}
const users = [...new Set([...global.conns.filter(_0x3e440f => _0x3e440f.user && _0x3e440f.ws.socket && _0x3e440f.ws.socket.readyState !== _0x3d7f01.CLOSED).map(_0x29fdc5 => _0x29fdc5)])];
async function loadSubbots() {
  const _0x4b0133 = _0x20893d.readdirSync('./' + jadi);
  for (const _0x39c942 of _0x4b0133) {
    if (users.length >= 0x1e) {
      console.log(_0xbb23f3.cyan("🌳 Límite de 30 subbots alcanzado."));
      break;
    }
    const _0x2dc3f1 = './' + jadi + '/' + _0x39c942;
    if (_0x20893d.statSync(_0x2dc3f1).isDirectory()) {
      const {
        state: _0x2c9a72,
        saveCreds: _0xf4727d
      } = await useMultiFileAuthState(_0x2dc3f1);
      const {
        version: _0x610dbb
      } = await fetchLatestBaileysVersion();
      const _0xba1c68 = {
        'version': _0x610dbb,
        'keepAliveIntervalMs': 0x7530,
        'printQRInTerminal': false,
        'logger': _0x22c219({
          'level': "fatal"
        }),
        'auth': _0x2c9a72,
        'browser': ["Sylph", 'IOS', "4.1.0"]
      };
      let _0x1df9d0 = makeWASocket(_0xba1c68);
      _0x1df9d0.isInit = false;
      let _0x240279 = true;
      let _0x3ff5db = 0x0;
      async function _0x16fc4f(_0x45c724) {
        const {
          connection: _0xe18224,
          lastDisconnect: _0x26c31a,
          isNewLogin: _0x892dae
        } = _0x45c724;
        if (_0x892dae) {
          _0x1df9d0.isInit = true;
        }
        const _0x12ca56 = _0x26c31a?.['error']?.["output"]?.["statusCode"] || _0x26c31a?.['error']?.['output']?.["payload"]?.["statusCode"];
        if (_0x12ca56 && _0x12ca56 !== DisconnectReason.loggedOut && _0x1df9d0?.['ws']["socket"] == null) {
          let _0x422e51 = global.conns.indexOf(_0x1df9d0);
          if (_0x422e51 < 0x0) {
            return;
          }
          delete global.conns[_0x422e51];
          global.conns.splice(_0x422e51, 0x1);
        }
        if (_0xe18224 == 'open') {
          _0x1df9d0.isInit = true;
          _0x1df9d0.uptime = new Date();
          global.conns.push(_0x1df9d0);
          console.log(_0xbb23f3.blue("🌺 Subbot " + _0x39c942 + " conectado exitosamente."));
        }
        if (_0xe18224 === "close" || _0xe18224 === 'error') {
          _0x3ff5db++;
          let _0x164cdf = 0x3e8;
          if (_0x3ff5db > 0x4) {
            _0x164cdf = 0x2710;
          } else {
            if (_0x3ff5db > 0x3) {
              _0x164cdf = 0x1388;
            } else {
              if (_0x3ff5db > 0x2) {
                _0x164cdf = 0xbb8;
              } else {
                if (_0x3ff5db > 0x1) {
                  _0x164cdf = 0x7d0;
                }
              }
            }
          }
          setTimeout(async () => {
            try {
              _0x1df9d0.ws.close();
              _0x1df9d0.ev.removeAllListeners();
              _0x1df9d0 = makeWASocket(_0xba1c68);
              _0x1df9d0.handler = _0x473a38.handler.bind(_0x1df9d0);
              _0x1df9d0.connectionUpdate = _0x16fc4f.bind(_0x1df9d0);
              _0x1df9d0.credsUpdate = _0xf4727d.bind(_0x1df9d0, true);
              _0x1df9d0.ev.on('messages.upsert', _0x1df9d0.handler);
              _0x1df9d0.ev.on('connection.update', _0x1df9d0.connectionUpdate);
              _0x1df9d0.ev.on('creds.update', _0x1df9d0.credsUpdate);
              await _0x4e15c0(false);
            } catch (_0x711883) {
              console.log(_0xbb23f3.red("Error durante la reconexión : ", _0x711883));
            }
          }, _0x164cdf);
        }
        if (_0x12ca56 === DisconnectReason.loggedOut) {
          if (_0x20893d.existsSync(_0x2dc3f1)) {
            _0x20893d.rmdirSync(_0x2dc3f1, {
              'recursive': true
            });
            console.log(_0xbb23f3.yellow("Carpeta de credenciales eliminada para el subbot " + _0x39c942 + '.'));
          }
        }
      }
      let _0x473a38 = await import("../handler.js");
      let _0x4e15c0 = async function (_0x350b5c) {
        try {
          const _0x6431d7 = await import('../handler.js?update=' + Date.now())["catch"](console.error);
          if (Object.keys(_0x6431d7 || {}).length) {
            _0x473a38 = _0x6431d7;
          }
        } catch (_0x101ce3) {
          console.error(_0x101ce3);
        }
        if (_0x350b5c) {
          try {
            _0x1df9d0.ws.close();
          } catch {}
          _0x1df9d0.ev.removeAllListeners();
          _0x1df9d0 = makeWASocket(_0xba1c68);
          _0x240279 = true;
        }
        if (!_0x240279) {
          _0x1df9d0.ev.off("messages.upsert", _0x1df9d0.handler);
          _0x1df9d0.ev.off("connection.update", _0x1df9d0.connectionUpdate);
          _0x1df9d0.ev.off('creds.update', _0x1df9d0.credsUpdate);
        }
        _0x1df9d0.handler = _0x473a38.handler.bind(_0x1df9d0);
        _0x1df9d0.connectionUpdate = _0x16fc4f.bind(_0x1df9d0);
        _0x1df9d0.credsUpdate = _0xf4727d.bind(_0x1df9d0, true);
        _0x1df9d0.ev.on("messages.upsert", _0x1df9d0.handler);
        _0x1df9d0.ev.on("connection.update", _0x1df9d0.connectionUpdate);
        _0x1df9d0.ev.on("creds.update", _0x1df9d0.credsUpdate);
        _0x240279 = false;
        return true;
      };
      _0x4e15c0(false);
    }
  }
}
loadSubbots()["catch"](console.error);
let handler = async (_0xcfa5a1, {
  conn: _0x24a9cd,
  args: _0x567487,
  usedPrefix: _0x702e26,
  command: _0x496c76,
  isOwner: _0x347ac7
}) => {
  if (users.length >= 0x1e) {
    return _0x24a9cd.reply(_0xcfa5a1.chat, "*≡ Lo siento, se ha alcanzado el límite de 30 subbots. Por favor, intenta más tarde.*", _0xcfa5a1);
  }
  const _0x57c6e4 = _0x496c76 === "code" || _0x567487[0x0] && /(--code|code)/.test(_0x567487[0x0].trim());
  let _0x43a03d;
  let _0x312b49;
  let _0xde8ef5;
  let _0x388ca8 = _0xcfa5a1.mentionedJid && _0xcfa5a1.mentionedJid[0x0] ? _0xcfa5a1.mentionedJid[0x0] : _0xcfa5a1.fromMe ? _0x24a9cd.user.jid : _0xcfa5a1.sender;
  let _0x14ebd9 = '' + _0x388ca8.split`@`[0x0];
  if (_0x57c6e4) {
    _0x567487[0x0] = _0x567487[0x0]?.['replace'](/^--code$|^code$/, '')["trim"]() || undefined;
    if (_0x567487[0x1]) {
      _0x567487[0x1] = _0x567487[0x1].replace(/^--code$|^code$/, '').trim();
    }
  }
  if (!_0x20893d.existsSync('./' + jadi + '/' + _0x14ebd9)) {
    _0x20893d.mkdirSync('./' + jadi + '/' + _0x14ebd9, {
      'recursive': true
    });
  }
  if (_0x567487[0x0] && _0x567487[0x0] != undefined) {
    _0x20893d.writeFileSync('./' + jadi + '/' + _0x14ebd9 + '/creds.json', JSON.stringify(JSON.parse(Buffer.from(_0x567487[0x0], "base64").toString("utf-8")), null, "\t"));
  } else {
    '';
  }
  if (_0x20893d.existsSync('./' + jadi + '/' + _0x14ebd9 + "/creds.json")) {
    let _0x3b55e1 = JSON.parse(_0x20893d.readFileSync('./' + jadi + '/' + _0x14ebd9 + "/creds.json"));
    if (_0x3b55e1) {
      if (_0x3b55e1.registered === false) {
        _0x20893d.unlinkSync('./' + jadi + '/' + _0x14ebd9 + "/creds.json");
      }
    }
  }
  async function _0x472b6b() {
    let _0x1a9111 = _0xcfa5a1.mentionedJid && _0xcfa5a1.mentionedJid[0x0] ? _0xcfa5a1.mentionedJid[0x0] : _0xcfa5a1.fromMe ? _0x24a9cd.user.jid : _0xcfa5a1.sender;
    let _0x5cf915 = '' + _0x1a9111.split`@`[0x0];
    if (!_0x20893d.existsSync('./' + jadi + '/' + _0x5cf915)) {
      _0x20893d.mkdirSync('./' + jadi + '/' + _0x5cf915, {
        'recursive': true
      });
    }
    if (_0x567487[0x0]) {
      _0x20893d.writeFileSync('./' + jadi + '/' + _0x5cf915 + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(_0x567487[0x0], 'base64').toString("utf-8")), null, "\t"));
    } else {
      '';
    }
    let {
      version: _0x5af92c,
      isLatest: _0x4d862b
    } = await fetchLatestBaileysVersion();
    const _0x14540c = _0x4fabce => {};
    const _0x513fdb = new _0x3378da();
    const {
      state: _0x3b0d67,
      saveState: _0x93f26f,
      saveCreds: _0x408f63
    } = await useMultiFileAuthState('./' + jadi + '/' + _0x5cf915);
    const _0x504531 = {
      'printQRInTerminal': false,
      'logger': _0x22c219({
        'level': 'silent'
      }),
      'auth': {
        'creds': _0x3b0d67.creds,
        'keys': makeCacheableSignalKeyStore(_0x3b0d67.keys, _0x22c219({
          'level': 'silent'
        }))
      },
      'msgRetry': _0x14540c,
      'msgRetryCache': _0x513fdb,
      'version': [0x2, 0xbb8, 0x3c8d6c7b],
      'syncFullHistory': true,
      'browser': _0x57c6e4 ? ['Ubuntu', "Chrome", "110.0.5585.95"] : ["Sylphiette", "Chrome", '2.0.0'],
      'defaultQueryTimeoutMs': undefined,
      'getMessage': async _0x1e78e0 => {
        if (store) {}
        return {
          'conversation': "Sylphiette"
        };
      }
    };
    let _0x541ba3 = makeWASocket(_0x504531);
    _0x541ba3.isInit = false;
    let _0x220719 = true;
    async function _0xbca510(_0x25b82d) {
      const {
        connection: _0x145df0,
        lastDisconnect: _0x3afa2c,
        isNewLogin: _0x2126d7,
        qr: _0x4f55f8
      } = _0x25b82d;
      if (_0x2126d7) {
        _0x541ba3.isInit = false;
      }
      if (_0x4f55f8 && !_0x57c6e4) {
        _0xde8ef5 = await _0x24a9cd.sendMessage(_0xcfa5a1.chat, {
          'image': await _0xe1604d.toBuffer(_0x4f55f8, {
            'scale': 0x8
          }),
          'caption': "≡ Escanea este código QR para conectarte como subbot.\n\n> Powered by i'm Fz ~",
          'contextInfo': {
            'forwardingScore': 0x3e7,
            'isForwarded': true
          }
        }, {
          'quoted': fkontak
        });
        return;
      }
      if (_0x4f55f8 && _0x57c6e4) {
        _0x43a03d = await _0x24a9cd.sendMessage(_0xcfa5a1.chat, {
          'text': "≡ Introduce el siguiente código para convertirte en subbot.\n\n> Powered by i'm Fz ~",
          'contextInfo': {
            'forwardingScore': 0x3e7,
            'isForwarded': true
          }
        }, {
          'quoted': fkontak
        });
        await sleep(0xbb8);
        _0x312b49 = await _0x541ba3.requestPairingCode(_0xcfa5a1.sender.split`@`[0x0], 'SYLPHUWU');
        _0x312b49 = await _0x24a9cd.sendMessage(_0xcfa5a1.chat, {
          'text': _0x312b49,
          'contextInfo': {
            'forwardingScore': 0x3e7,
            'isForwarded': true
          }
        }, {
          'quoted': fkontak
        });
      }
      const _0x5a531a = _0x3afa2c?.["error"]?.["output"]?.["statusCode"] || _0x3afa2c?.["error"]?.["output"]?.["payload"]?.["statusCode"];
      console.log(_0x5a531a);
      const _0x2f5b2a = async _0x5e66f5 => {
        if (!_0x5e66f5) {
          try {
            _0x541ba3.ws.close();
          } catch {}
          _0x541ba3.ev.removeAllListeners();
          let _0x22f5da = global.conns.indexOf(_0x541ba3);
          if (_0x22f5da < 0x0) {
            return;
          }
          delete global.conns[_0x22f5da];
          global.conns.splice(_0x22f5da, 0x1);
        }
      };
      const _0x5efe38 = _0x3afa2c?.["error"]?.['output']?.["statusCode"] || _0x3afa2c?.["error"]?.["output"]?.['payload']?.['statusCode'];
      if (_0x145df0 === 'close') {
        console.log(_0x5efe38);
        if (_0x5efe38 == 0x195) {
          await _0x20893d.unlinkSync('./' + jadi + '/' + _0x5cf915 + "/creds.json");
          return await _0xcfa5a1.reply("≡ Reenvia nuevamente el comando.");
        }
        if (_0x5efe38 === DisconnectReason.restartRequired) {
          _0x472b6b();
          return console.log("\n≡ Tiempo de conexión agotado, reconectando...");
        } else {
          if (_0x5efe38 === DisconnectReason.loggedOut) {
            _0x20893d.rmdirSync('./' + jadi + '/' + _0x5cf915, {
              'recursive': true
            });
            return _0xcfa5a1.reply("≡ *Conexión perdida...*");
          } else {
            if (_0x5efe38 == 0x1ac) {
              await _0x2f5b2a(false);
              return _0xcfa5a1.reply("≡ La conexión se ha cerrado de manera inesperada, intentaremos reconectar...");
            } else {
              if (_0x5efe38 === DisconnectReason.connectionLost) {
                await _0x472b6b();
                return console.log("\n≡Conexión perdida con el servidor, reconectando....");
              } else {
                if (_0x5efe38 === DisconnectReason.badSession) {
                  return await _0xcfa5a1.reply("≡ La conexión se ha cerrado, deberá de conectarse manualmente usando el comando *.serbot* o *.code*");
                } else {
                  if (_0x5efe38 === DisconnectReason.timedOut) {
                    await _0x2f5b2a(false);
                    return console.log("\n≡ Tiempo de conexión agotado, reconectando....");
                  } else {
                    console.log("\n≡ Razón de la desconexión desconocida: " + (_0x5efe38 || '') + " >> " + (_0x145df0 || ''));
                  }
                }
              }
            }
          }
        }
      }
      if (global.db.data == null) {
        loadDatabase();
      }
      if (_0x145df0 == "open") {
        _0x541ba3.isInit = true;
        _0x541ba3.uptime = new Date();
        global.conns.push(_0x541ba3);
        await _0x24a9cd.sendMessage(_0xcfa5a1.chat, {
          'text': _0x567487[0x0] ? "≡ *¡Está conectado!*\nPor favor espere se está cargando los mensajes..." : "¡Conectado con éxito!"
        }, {
          'quoted': _0xcfa5a1
        });
        if (!_0x567487[0x0]) {}
      }
    }
    setInterval(async () => {
      if (!_0x541ba3.user) {
        try {
          _0x541ba3.ws.close();
        } catch (_0x31a130) {
          console.log(await _0x1ac93f(true)["catch"](console.error));
        }
        _0x541ba3.ev.removeAllListeners();
        let _0x58d033 = global.conns.indexOf(_0x541ba3);
        if (_0x58d033 < 0x0) {
          return;
        }
        delete global.conns[_0x58d033];
        global.conns.splice(_0x58d033, 0x1);
      }
    }, 0xea60);
    let _0x60c75e = await import('../handler.js');
    let _0x1ac93f = async _0x378956 => {
      try {
        const _0x3ab50c = await import('../handler.js?update=' + Date.now())["catch"](console.error);
        if (Object.keys(_0x3ab50c || {}).length) {
          _0x60c75e = _0x3ab50c;
        }
      } catch (_0x2f7352) {
        console.error(_0x2f7352);
      }
      if (_0x378956) {
        const _0x391dd7 = _0x541ba3.chats;
        try {
          _0x541ba3.ws.close();
        } catch {}
        _0x541ba3.ev.removeAllListeners();
        _0x541ba3 = makeWASocket(_0x504531, {
          'chats': _0x391dd7
        });
        _0x220719 = true;
      }
      if (!_0x220719) {
        _0x541ba3.ev.off('messages.upsert', _0x541ba3.handler);
        _0x541ba3.ev.off("connection.update", _0x541ba3.connectionUpdate);
        _0x541ba3.ev.off("creds.update", _0x541ba3.credsUpdate);
      }
      const _0x5cc27c = new Date();
      const _0x2f2485 = new Date(_0x541ba3.ev * 0x3e8);
      if (_0x5cc27c.getTime() - _0x2f2485.getTime() <= 0x493e0) {
        console.log("Leyendo mensaje entrante:", _0x541ba3.ev);
        Object.keys(_0x541ba3.chats).forEach(_0xdf944b => {
          _0x541ba3.chats[_0xdf944b].isBanned = false;
        });
      } else {
        console.log(_0x541ba3.chats, "🚩 Omitiendo mensajes en espera.", _0x541ba3.ev);
        Object.keys(_0x541ba3.chats).forEach(_0x6502b9 => {
          _0x541ba3.chats[_0x6502b9].isBanned = true;
        });
      }
      _0x541ba3.handler = _0x60c75e.handler.bind(_0x541ba3);
      _0x541ba3.connectionUpdate = _0xbca510.bind(_0x541ba3);
      _0x541ba3.credsUpdate = _0x408f63.bind(_0x541ba3, true);
      _0x541ba3.ev.on("messages.upsert", _0x541ba3.handler);
      _0x541ba3.ev.on("connection.update", _0x541ba3.connectionUpdate);
      _0x541ba3.ev.on("creds.update", _0x541ba3.credsUpdate);
      _0x220719 = false;
      return true;
    };
    _0x1ac93f(false);
  }
  _0x472b6b();
};
handler.help = ["serbot", "serbot --code", "code"];
handler.tags = ["bebot"];
handler.command = ["jadibot", "serbot", "code"];
export default handler;
function sleep(_0x558beb) {
  return new Promise(_0x1b4d40 => setTimeout(_0x1b4d40, _0x558beb));
}