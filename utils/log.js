const { WebhookClient, EmbedBuilder } = require('discord.js')

const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1276620993720225833/C4g1-L9bYl8F5r7XLViIMUoqObna7trRWOHL_MhQwLoVdza5BTTwlB9K6PdNotP2Uaar' })

module.exports = {
    online: async function (date) {
        const discordDate = Math.floor(date / 1000)

        const embed = new EmbedBuilder()
            .setTitle('Bot Online')
            .setDescription(`Bot online @ <t:${discordDate}:T>`)
            .setColor('#05ef9d')

        await webhook.send({ embeds: [embed] })
    },
    offline: async function (date) {
        const discordDate = Math.floor(date / 1000)

        const embed = new EmbedBuilder()
            .setTitle('Bot Offline')
            .setDescription(`Bot offline @ <t:${discordDate}:T>`)
            .setColor('#FF0000')

        await webhook.send({ embeds: [embed] })
    },
    /**
     * 
     * @param {Error} error 
     * @returns 
     */
    error: async function (error) {
        if (!error) return

        console.error(error)

        const embed = new EmbedBuilder()
            .setTitle(error.name)
            .setDescription(error.message)
            .setTimestamp(Date.now())
            .setColor('#FF0000')

        await webhook.send({ embeds: [embed] })
    },
    text: async function (text) {
        await webhook.send({ content: text.toString() })
    }
}