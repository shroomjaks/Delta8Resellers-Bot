const { Events, WebhookClient, EmbedBuilder, BaseClient, Client } = require('discord.js')

module.exports = {
    event: Events.ClientReady,
    once: true,
    disabled: false,
    /**
     * 
     * @param {Client} client 
     */
    execute: async function (client) {
        console.log(`Logged in as ${client.user.username}`)

        client.readyTime = Date.now()
        client.log.online(Date.now())

        client.mainGuild = await client.guilds.fetch('1276202598692818996')
        client.updateChannel = await client.channels.fetch('1276548924936814755')

        const verifyChannel = await client.channels.fetch('1276212096601686067')
        const verifyMessage = await verifyChannel.messages.fetch('1277129869565759510')

        await verifyMessage.react('✅')

        setInterval(() => client.emit('stockCheck', client), 15 * 60 * 1000)
    }
}