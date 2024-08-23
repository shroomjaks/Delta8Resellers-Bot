const { EmbedBuilder } = require('discord.js')

const os = require('os')

module.exports = {
    name: 'ping',
    description: 'Checks the bot latency in milliseconds.',
    permissions: [],
    execute: async function (interaction, client) {
        const freeMemoryGB = Math.round((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024)
        const totalMemoryGB = Math.round(os.totalmem() / 1024 / 1024 / 1024)

        const processMemoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)

        const systemUptime = Math.floor((Date.now() / 1000) - os.uptime())
        const botUptime = Math.floor(client.readyTime / 1000)

        const ping = Date.now() - interaction.createdTimestamp

        const embed1 = new EmbedBuilder()
            .setTitle('Pong! 🏓')
            .setFields(
                { name: '🤖 Bot Latency', value: `${ping}ms`, inline: true },
                { name: '🌐 API Latency', value: `${client.ws.ping}ms`, inline: true },
                { name: '🧠 System Memory Usage', value: `${freeMemoryGB}GB / ${totalMemoryGB}GB`, inline: true },
                { name: '🧠 Bot Memory Usage', value: `${processMemoryMB}MB`, inline: true },
                { name: '⌚ System Start Up', value: `<t:${systemUptime}:R>`, inline: true },
                { name: '⌚ Bot Start Up', value: `<t:${botUptime}:R>`, inline: true }
            )
            .setColor('#05ef9d')

        await interaction.reply({ embeds: [embed1], ephemeral: true })
    }
}