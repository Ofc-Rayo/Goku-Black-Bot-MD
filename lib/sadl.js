import _0xee9b9d from 'axios';
import _0x356d09 from 'yt-search';
import { createDecipheriv } from 'crypto';
async function withRetries(_0x5b2c61) {
  let _0x5b1848;
  for (let _0x48f8df = 0x0; _0x48f8df < 0x3; _0x48f8df++) {
    try {
      return await _0x5b2c61();
    } catch (_0x11bf58) {
      _0x5b1848 = _0x11bf58;
      if (_0x48f8df < 0x2) {
        await new Promise(_0x1e83f7 => setTimeout(_0x1e83f7, 0xc8));
      }
    }
  }
  throw _0x5b1848;
}
function decode(_0x57cfdf) {
  try {
    const _0x168d16 = Buffer.from(_0x57cfdf, 'base64');
    const _0x31444d = _0x168d16.slice(0x0, 0x10);
    const _0x425e35 = _0x168d16.slice(0x10);
    const _0x1f9d95 = Buffer.from("C5D58EF67A7584E4A29F6C35BBC4EB12", "hex");
    const _0x4c9933 = createDecipheriv("aes-128-cbc", _0x1f9d95, _0x31444d);
    let _0xd8d360 = Buffer.concat([_0x4c9933.update(_0x425e35), _0x4c9933.final()]);
    return JSON.parse(_0xd8d360.toString());
  } catch (_0x5d40da) {
    throw new Error("Fallo en la decodificación: " + _0x5d40da.message);
  }
}
async function _getSavetubeInfo(_0x32da27) {
  const _0x3e0ff5 = await _0xee9b9d.get('https://media.savetube.me/api/random-cdn', {
    'timeout': 0x1b58
  });
  const _0x1f9a64 = _0x3e0ff5?.["data"]?.["cdn"];
  if (!_0x1f9a64) {
    throw new Error("No se pudo obtener un CDN de Savetube.");
  }
  const _0x3e167f = await _0xee9b9d.post('https://' + _0x1f9a64 + "/v2/info", {
    'url': _0x32da27
  }, {
    'timeout': 0x1b58
  });
  if (!_0x3e167f?.["data"]?.["data"]) {
    throw new Error("No se obtuvo información del video de Savetube.");
  }
  const _0x5d9fe7 = decode(_0x3e167f.data.data);
  if (!_0x5d9fe7.key) {
    throw new Error("No se pudo decodificar la clave de descarga.");
  }
  return {
    'cdn': _0x1f9a64,
    'info': _0x5d9fe7
  };
}
async function _fetchAudioFromSavetube(_0x5c1022) {
  return withRetries(async () => {
    const {
      cdn: _0x341684,
      info: _0x2f2c24
    } = await _getSavetubeInfo(_0x5c1022);
    const _0x324c1d = await _0xee9b9d.post("https://" + _0x341684 + "/download", {
      'downloadType': "audio",
      'quality': "128",
      'key': _0x2f2c24.key
    }, {
      'timeout': 0x1b58
    });
    const _0x56d0a9 = _0x324c1d?.['data']?.["data"]?.["downloadUrl"] || _0x324c1d?.['data']?.["downloadUrl"];
    if (!_0x56d0a9) {
      throw new Error("No se pudo obtener el enlace de descarga de audio final.");
    }
    return {
      'title': _0x2f2c24.title,
      'mp3': _0x56d0a9
    };
  });
}
async function _fetchVideoFromSavetube(_0x5761e3) {
  return withRetries(async () => {
    const {
      cdn: _0x1c6df3,
      info: _0x4d2ae5
    } = await _getSavetubeInfo(_0x5761e3);
    const _0x35f9ea = await _0xee9b9d.post('https://' + _0x1c6df3 + "/download", {
      'downloadType': "video",
      'quality': '360',
      'key': _0x4d2ae5.key
    }, {
      'timeout': 0x1b58
    });
    const _0x4a1206 = _0x35f9ea?.["data"]?.["data"]?.['downloadUrl'] || _0x35f9ea?.["data"]?.["downloadUrl"];
    if (!_0x4a1206) {
      throw new Error("No se pudo obtener el enlace de descarga de video final.");
    }
    return {
      'title': _0x4d2ae5.title,
      'mp4': _0x4a1206
    };
  });
}
function getYouTubeVideoId(_0x1f2aad) {
  const _0x4a371c = /(?:youtu\.be\/|youtube\.com\/(?:.*v=|[^\/]+\/.+\/|.*embed\/))([^&?\/]+)/;
  const _0xca71a = _0x1f2aad.match(_0x4a371c);
  return _0xca71a ? _0xca71a[0x1] : null;
}
async function handleDownload(_0x3cca06, _0xfd384e) {
  const _0x2fd1fd = getYouTubeVideoId(_0x3cca06);
  if (!_0x2fd1fd) {
    return {
      'status': false,
      'message': "URL de YouTube inválida."
    };
  }
  try {
    const _0xec2dda = _0xfd384e === "mp3" ? _fetchAudioFromSavetube(_0x3cca06) : _fetchVideoFromSavetube(_0x3cca06);
    const _0x43a057 = await Promise.allSettled([_0x356d09({
      'videoId': _0x2fd1fd
    }), _0xec2dda]);
    const _0x18e628 = _0x43a057[0x0];
    const _0x36a8b4 = _0x43a057[0x1];
    if (_0x36a8b4.status === "rejected") {
      throw new Error(_0x36a8b4.reason.message);
    }
    const _0x52213f = _0x36a8b4.value;
    const _0x418f14 = _0xfd384e === "mp3" ? _0x52213f.mp3 : _0x52213f.mp4;
    const _0x19e902 = _0x18e628.status === "fulfilled" ? _0x18e628.value : {};
    const _0x101690 = _0x19e902.title || _0x52213f.title || "video";
    return {
      'status': true,
      'metadata': {
        'title': _0x101690,
        'thumbnail': _0x19e902.thumbnail,
        'duration': _0x19e902.duration,
        'author': _0x19e902.author?.["name"],
        'url': _0x19e902.url
      },
      'download': {
        'quality': _0xfd384e === "mp3" ? "128kbps" : "360p",
        'url': _0x418f14,
        'filename': _0x101690 + '.' + _0xfd384e
      }
    };
  } catch (_0x364a5c) {
    return {
      'status': false,
      'message': _0x364a5c.message
    };
  }
}
const ytmp3 = _0xaf4c64 => handleDownload(_0xaf4c64, "mp3");
const ytmp4 = _0x3ece36 => handleDownload(_0x3ece36, "mp4");
async function ytdlv2(_0x3a0ba5) {
  try {
    const _0x563227 = getYouTubeVideoId(_0x3a0ba5);
    if (!_0x563227) {
      return {
        'status': false,
        'message': "URL de YouTube inválida."
      };
    }
    const _0x1411e4 = await Promise.allSettled([_0x356d09({
      'videoId': _0x563227
    }), _fetchAudioFromSavetube(_0x3a0ba5), _fetchVideoFromSavetube(_0x3a0ba5)]);
    const _0x37f2dc = _0x1411e4[0x0].status === "fulfilled" ? _0x1411e4[0x0].value : {};
    const _0x39163a = _0x1411e4[0x1].status === 'fulfilled' ? _0x1411e4[0x1].value : null;
    const _0x33033b = _0x1411e4[0x2].status === "fulfilled" ? _0x1411e4[0x2].value : null;
    if (!_0x39163a && !_0x33033b) {
      throw new Error("Fallaron tanto la descarga de audio como la de video.");
    }
    return {
      'status': true,
      'metadata': {
        'title': _0x37f2dc.title || _0x39163a?.['title'] || _0x33033b?.["title"] || "video",
        'thumbnail': _0x37f2dc.thumbnail,
        'duration': _0x37f2dc.duration,
        'author': _0x37f2dc.author?.["name"],
        'url': _0x37f2dc.url
      },
      'downloads': {
        'audio': _0x39163a?.["mp3"] || null,
        'video': _0x33033b?.["mp4"] || null
      }
    };
  } catch (_0x31542a) {
    return {
      'status': false,
      'message': _0x31542a.message
    };
  }
}
export { ytmp3, ytmp4, ytdlv2 };