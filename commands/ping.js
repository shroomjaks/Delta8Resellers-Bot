const { ChatInputCommandInteraction, EmbedBuilder } = require('discord.js')

const os = require('os')

module.exports = {
    name: 'ping',
    description: 'Checks the bot latency in milliseconds.',
    permissions: [],
    options: [],
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async function (interaction) {
        const systemUptime = Math.floor((Date.now() / 1000) - os.uptime())
        const botUptime = Math.floor(client.readyTime / 1000)

        const ping = Math.abs(interaction.createdTimestamp - Date.now())

        const embed1 = new EmbedBuilder()
            .setTitle('Pong! 🏓')
            .setFields(
                { name: '🤖 Bot Latency', value: `${ping}ms`, inline: true },
                { name: '🌐 API Latency', value: `${client.ws.ping}ms`, inline: true },
                { name: '⌚ System Start Up', value: `<t:${systemUptime}:R>`, inline: true },
                { name: '⌚ Bot Start Up', value: `<t:${botUptime}:R>`, inline: true }
            )
            .setColor('#05ef9d')

        await interaction.reply({ embeds: [embed1], ephemeral: true })
    }
}