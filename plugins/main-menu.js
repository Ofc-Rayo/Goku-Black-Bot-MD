import sharp from "sharp";
import moment from "moment-timezone";

let handler = async (m, { conn }) => {
  m.react("🍂");

  let name = await conn.getName(m.sender);

  const menutext = `
${ucapan()} @${m.sender.split("@")[0]}!

\`COMANDOS\`
• play
• tiktok
• fb

> Comandos disponibles por el momento
  `;

  const mention = conn.parseMention(menutext);

  try {
    let imager = await sharp('./src/doc_image.jpg')
      .resize(400, 400)
      .toBuffer();

    let imgUrl = "https://files.catbox.moe/uuglrm.jpg";

    await conn.sendMessage(
      m.chat,
      {
        document: { url: imgUrl },
        fileName: "ѕуℓρнιєттє'ѕ",
        mimetype: "image/png",
        caption: menutext,
        fileLength: 1900,
        jpegThumbnail: imager,
        contextInfo: {
          mentionedJid: mention,
          isForwarded: true,
          forwardingScore: 999,
          externalAdReply: {
            title: "",
            body: `あ ${wm}`,
            thumbnail: { url: imgUrl },
            sourceUrl: "",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
  } catch (e) {
    await conn.reply(m.chat, menutext, m, { mentions: mention });
    await conn.reply(m.chat, "❎ Error al mostrar el menú principal: " + e, m);
  }
};

handler.command = ["menu", "help", "menú", "commands", "comandos", "?"];
export default handler;

function ucapan() {
  const time = moment.tz("America/Los_Angeles").format("HH");
  if (time >= 18) return "Good night.";
  if (time >= 15) return "Good afternoon.";
  if (time >= 10) return "Good afternoon.";
  if (time >= 4) return "Good morning.";
  return "Hello.";
}