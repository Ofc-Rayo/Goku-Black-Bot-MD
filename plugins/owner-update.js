import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
    if (typeof m.react === 'function') await m.react('✅')
    try {
        const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''))
        await conn.reply(m.chat, stdout.toString(), m)
    } catch (error) {
        await conn.reply(m.chat, '❌ Error al ejecutar git pull:\n' + error.message, m)
    }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed'] 
handler.rowner = true

export default handler