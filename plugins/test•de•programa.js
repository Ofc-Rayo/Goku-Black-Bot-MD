const handler = async (m, { conn, text }) => {
    const emoji = '⏰';
    if (!text) throw `${emoji} Ingresa el número de teléfono, la fecha y hora, y el mensaje.\n\nEjemplo:\n+595981234567|2025-12-27 14:30|Hola, este es un mensaje programado.`;


    const parts = text.split('|');
    if (parts.length < 3) throw `${emoji} Formato incorrecto.\n\nEjemplo:\n+595981234567|2025-12-27 14:30|Hola, este es un mensaje programado.`;

    const numero = parts[0].replace(/\D/g, '') + '@s.whatsapp.net'; // Número a enviar
    const fechaHoraStr = parts[1]; // Fecha y hora como string
    const mensaje = parts.slice(2).join('|'); // Mensaje a enviar

    const fecha = new Date(fechaHoraStr);
    if (isNaN(fecha.getTime())) throw `${emoji} Fecha y hora inválidas. Usa formato: YYYY-MM-DD HH:MM`;

    const ahora = new Date();
    const tiempoEspera = fecha.getTime() - ahora.getTime();
    if (tiempoEspera <= 0) throw `${emoji} La fecha y hora debe ser futura.`;

    m.reply(`${emoji} Mensaje programado para el ${fecha.toLocaleString()} a ${parts[0]}.`);

    setTimeout(() => {
        conn.sendMessage(numero, { text: mensaje });
    }, tiempoEspera);
};

handler.command = ['programar'];
handler.rowner = true;

export default handler;