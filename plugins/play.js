import { ytmp3, ytmp4 } from '../lib/sadl.js';
import _0x19f0dc from 'yt-search';
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;
const handler = async (_0x989059, {
  conn: _0xa3c13b,
  text: _0x1d9f71,
  command: _0x542791
}) => {
  try {
    let _0x4bc0cf = null;
    try {
      const _0x3ff037 = await fetch('https://i.postimg.cc/k5JmXxmT/Nuevo-proyecto-8694C3E.png');
      const _0xe8473 = Buffer.from(await _0x3ff037.arrayBuffer());
      _0x4bc0cf = {
        'key': {
          'participant': "0@s.whatsapp.net",
          'remoteJid': "status@broadcast",
          'fromMe': false,
          'id': "Halo"
        },
        'message': {
          'locationMessage': {
            'name': "𝙔𝙊𝙐𝙏𝙐𝘽𝙀 - 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿",
            'jpegThumbnail': _0xe8473
          }
        },
        'participant': '0@s.whatsapp.net'
      };
    } catch {}
    if (!_0x1d9f71 || !_0x1d9f71.trim()) {
      return _0xa3c13b.reply(_0x989059.chat, "✧ 𝙃𝙚𝙮! Debes escribir *el nombre o link* del video/audio para descargar.", _0x989059, rcanal);
    }
    await _0xa3c13b.sendMessage(_0x989059.chat, {
      'react': {
        'text': '⏳',
        'key': _0x989059.key
      }
    });
    let _0x5db1f7 = _0x1d9f71.match(youtubeRegexID);
    let _0xf1d374 = await _0x19f0dc(_0x5db1f7 ? "https://youtu.be/" + _0x5db1f7[0x1] : _0x1d9f71);
    if (_0x5db1f7) {
      const _0x2f754d = _0x5db1f7[0x1];
      _0xf1d374 = _0xf1d374.all.find(_0x2014c9 => _0x2014c9.videoId === _0x2f754d) || _0xf1d374.videos.find(_0x5ef690 => _0x5ef690.videoId === _0x2f754d);
    }
    _0xf1d374 = _0xf1d374?.['all']?.[0x0] || _0xf1d374?.["videos"]?.[0x0] || _0xf1d374;
    if (!_0xf1d374) {
      await _0xa3c13b.sendMessage(_0x989059.chat, {
        'react': {
          'text': '❌',
          'key': _0x989059.key
        }
      });
      return _0x989059.reply("⚠︎ No encontré resultados, intenta con otro nombre o link.");
    }
    let {
      title: _0x2cecc8,
      thumbnail: _0x9f1db4,
      timestamp: _0x43cde0,
      views: _0x52dcce,
      ago: _0x350a08,
      url: _0x39420c,
      author: _0x308020
    } = _0xf1d374;
    const _0x510728 = formatViews(_0x52dcce);
    const _0x428a11 = _0x308020?.["name"] || "Desconocido";
    const _0xb8a906 = ("\nㅤ۫ ㅤ  🦭 ୧   ˚ `𝒅𝒆𝒔𝒄𝒂𝒓𝒈𝒂 𝒆𝒏 𝒄𝒂𝒎𝒊𝒏𝒐` !  ୨ 𖹭  ִֶָ  \n\n᮫ؙܹ  ᳘︵᮫ּܹ࡛〫ࣥܳ⌒ؙ۫ ᮫ּ۪֯⏝ֺ࣯࠭۟ ᮫ּ〪࣭︶᮫ܹ᳟〫࠭߳፝֟᷼⏜᮫᮫ּ〪࣭࠭〬︵᮫ּ᳝̼࣪ 🍚⃘ᩚּ̟߲ ּ〪࣪︵᮫࣭࣪࠭ᰯּ〪࣪࠭⏜ְ࣮〫߳ ᮫ּׅ࣪۟︶᮫ܹׅ࠭〬 ᮫ּּ࣭᷼⏝ᩥ᮫〪ܹ۟࠭۟۟ ᮫ּؙ⌒᮫ܹ۫︵ᩝּּ۟࠭ ࣭۪۟\n> 🧊✿⃘࣪◌ ֪ `𝗧𝗶́𝘁𝘂𝗹𝗼` » *" + _0x2cecc8 + "*\n> 🧊✿⃘࣪◌ ֪ `𝗖𝗮𝗻𝗮𝗹` » *" + _0x428a11 + "*\n> 🧊✿⃘࣪◌ ֪ `𝗗𝘂𝗿𝗮𝗰𝗶𝗼́𝗻` » *" + _0x43cde0 + "*\n> 🧊✿⃘࣪◌ ֪ `𝗩𝗶𝘀𝘁𝗮𝘀` » *" + _0x510728 + "*\n> 🧊✿⃘࣪◌ ֪ `𝗣𝘂𝗯𝗹𝗶𝗰𝗮𝗱𝗼` » *" + _0x350a08 + "*\n> 🧊✿⃘࣪◌ ֪ `𝗟𝗶𝗻𝗸` » " + _0x39420c + "\n\n> 𐙚 🪵 ｡ Preparando tu descarga... ˙𐙚\n    ").trim();
    const _0x55e98b = (await _0xa3c13b.getFile(_0x9f1db4))?.["data"];
    await _0xa3c13b.sendMessage(_0x989059.chat, {
      'text': _0xb8a906,
      'contextInfo': {
        'externalAdReply': {
          'title': botname,
          'body': dev,
          'mediaType': 0x1,
          'thumbnail': _0x55e98b,
          'renderLargerThumbnail': true,
          'mediaUrl': _0x39420c,
          'sourceUrl': _0x39420c
        }
      }
    }, {
      'quoted': _0x4bc0cf
    });
    if (["play", "yta", "ytmp3", "playaudio"].includes(_0x542791)) {
      let _0xeab2db = null;
      try {
        const _0x351c6a = await ytmp3(_0x39420c);
        if (_0x351c6a?.["status"] && _0x351c6a?.["download"]?.['url']) {
          _0xeab2db = {
            'link': _0x351c6a.download.url,
            'title': _0x351c6a.metadata?.["title"]
          };
        }
      } catch (_0x360e4d) {
        console.error(_0x360e4d);
      }
      if (!_0xeab2db) {
        await _0xa3c13b.sendMessage(_0x989059.chat, {
          'react': {
            'text': '❌',
            'key': _0x989059.key
          }
        });
        return _0xa3c13b.reply(_0x989059.chat, "✦ No se pudo descargar el audio. Intenta más tarde.", _0x989059);
      }
      await _0xa3c13b.sendMessage(_0x989059.chat, {
        'audio': {
          'url': _0xeab2db.link
        },
        'fileName': (_0xeab2db.title || 'music') + ".mp3",
        'mimetype': 'audio/mpeg',
        'ptt': false
      }, {
        'quoted': _0x989059
      });
      await _0xa3c13b.sendMessage(_0x989059.chat, {
        'react': {
          'text': '✅',
          'key': _0x989059.key
        }
      });
    } else {
      if (["play2", "ytv", "ytmp4", "mp4"].includes(_0x542791)) {
        let _0x2cc069 = null;
        try {
          const _0x12e471 = await ytmp4(_0x39420c);
          if (_0x12e471?.["status"] && _0x12e471?.['download']?.['url']) {
            _0x2cc069 = {
              'link': _0x12e471.download.url,
              'title': _0x12e471.metadata?.["title"]
            };
          }
        } catch (_0x33523a) {
          console.error(_0x33523a);
        }
        if (!_0x2cc069) {
          await _0xa3c13b.sendMessage(_0x989059.chat, {
            'react': {
              'text': '❌',
              'key': _0x989059.key
            }
          });
          return _0xa3c13b.reply(_0x989059.chat, "✦ No se pudo descargar el video. Intenta más tarde.", _0x989059);
        }
        await _0xa3c13b.sendMessage(_0x989059.chat, {
          'video': {
            'url': _0x2cc069.link
          },
          'fileName': (_0x2cc069.title || "video") + ".mp4",
          'caption': '' + _0x2cecc8,
          'mimetype': "video/mp4"
        }, {
          'quoted': _0x989059
        });
        await _0xa3c13b.sendMessage(_0x989059.chat, {
          'react': {
            'text': '✅',
            'key': _0x989059.key
          }
        });
      }
    }
  } catch (_0x365eba) {
    await _0xa3c13b.sendMessage(_0x989059.chat, {
      'react': {
        'text': '❌',
        'key': _0x989059.key
      }
    });
    console.error(_0x365eba);
    return _0x989059.reply("⚠︎ Error inesperado. Por favor, reporta este problema.");
  }
};
handler.command = ["play", "yta", "ytmp3", 'play2', "ytv", "ytmp4", 'playaudio', 'mp4'];
handler.help = ["play", "yta", "ytmp3", "play2", "ytv", "ytmp4", "playaudio", "mp4"];
handler.tags = ["descargas"];
export default handler;
function formatViews(_0x2bc36a) {
  if (!_0x2bc36a) {
    return "No disponible";
  }
  if (_0x2bc36a >= 0x3b9aca00) {
    return (_0x2bc36a / 0x3b9aca00).toFixed(0x1) + 'B';
  }
  if (_0x2bc36a >= 0xf4240) {
    return (_0x2bc36a / 0xf4240).toFixed(0x1) + 'M';
  }
  if (_0x2bc36a >= 0x3e8) {
    return (_0x2bc36a / 0x3e8).toFixed(0x1) + 'k';
  }
  return _0x2bc36a.toString();
}