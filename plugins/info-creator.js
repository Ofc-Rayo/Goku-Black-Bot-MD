function handler(m) { 
    const data = global.owner.filter(([id, isCreator]) => id && isCreator);
    const contacts = data.map(([id, name]) => [id, name]);
    const messageText = `*El dueño*\nMensaje\nVer canal`;
    this.sendContact(m.chat, contacts, m, {
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363276986902836@newsletter",
            serverMessageId: 100,
            newsletterName: 'sigue al creador'
        }
    });
    this.sendMessage(m.chat, { text: messageText }, { quoted: m });
} 

handler.help = ['owner'];
handler.tags = ['main'];
handler.command = ['owner', 'creator', 'creador', 'dueño'];

export default handler;