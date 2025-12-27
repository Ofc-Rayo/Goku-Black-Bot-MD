const handler = async (m, { conn }) => {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-ES'); // DD/MM/AAAA
    const hora = ahora.toLocaleTimeString('es-ES');   // HH:MM:SS

    const mensaje = `⏰ Hora del servidor: ${hora}\n📅 Fecha del servidor: ${fecha}`;

    await conn.sendMessage(m.chat, { text: mensaje });
};

handler.command = ['hora', 'fecha']; // Comandos que activan esto
handler.rowner = true; // Solo el dueño del bot puede usarlo (opcional)

export default handler;