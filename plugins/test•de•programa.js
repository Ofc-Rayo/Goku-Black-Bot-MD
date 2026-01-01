const handler = async (m, { conn, text }) => {
    const emoji = '⏰';
    if (!text) throw `${emoji} Ingresa el número de teléfono, la fecha y hora, y el mensaje.\n\nEjemplo:\n+595981234567|2025-12-27 14:30|Hola, este es un mensaje programado.`;

    const parts = text.split('|');
    if (parts.length < 3) throw `${emoji} Formato incorrecto.\n\nEjemplo:\n+595981234567|2025-12-27 14:30|Hola, este es un mensaje programado.`;

    const numero = parts[0].replace(/\D/g, '') + '@s.whatsapp.net';
    const fechaHoraStr = parts[1];
    const mensaje = parts.slice(2).join('|');

    const fecha = new Date(fechaHoraStr);
    if (isNaN(fecha.getTime())) throw `${emoji} Fecha y hora inválidas. Usa formato: YYYY-MM-DD HH:MM`;

    const ahora = new Date();
    let tiempoEspera = fecha.getTime() - ahora.getTime();
    if (tiempoEspera < 0) tiempoEspera = 0;

    m.reply(`${emoji} Mensaje programado para ${fecha.toLocaleString()} a ${parts[0]}.`);

    setTimeout(() => {
        conn.sendMessage(numero, { text: mensaje });
    }, tiempoEspera);
};

handler.command = ['programar'];
export default handler;