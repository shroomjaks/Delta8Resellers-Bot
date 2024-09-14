const { Client } = require('discord.js')

module.exports = {
    event: 'msgscan',
    once: false,
    disabled: false,
    /**
     * 
     * @param {Client} client 
     */
    execute: async function (client) {
        const channel = await client.channels.fetch('1276566237840805898')

        const messages = await channel.messages.fetch()

        for (const message of messages.values()) {
            if (message.author.bot) continue

            if (message.content.includes('discord.gg')) {
                await message.delete()
            }
        }
    }
}