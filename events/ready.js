const { Events, WebhookClient, EmbedBuilder, BaseClient, Client } = require('discord.js')

const fs = require('fs')
const path = require('path')


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
        
        const commandsFolder = fs.readdirSync(path.join(__dirname, '..', 'commands'))
        const eventsFolder = fs.readdirSync(path.join(__dirname, '..', 'events'))

        client.commands = []

        for (const commandFile of commandsFolder) {
            const command = require(path.join(__dirname, '..', 'commands', commandFile))

            client.commands.push(command)
        }

        for (const eventFile of eventsFolder) {
            const event = require(path.join(__dirname, '..', 'events', eventFile))

            if (event?.disabled) continue
            if (event.event === Events.ClientReady) continue

            try {
                if (event.once) {
                    client.once(event.event, (...args) => event.execute(...args, client))
                } else {
                    client.on(event.event, (...args) => event.execute(...args, client))
                }

                if (event.initialize) event.initialize(client)
            } catch (error) {
                console.error(error)

                const embed = new EmbedBuilder()
                    .setTitle(`Event ${event.event} Error`)
                    .setDescription(error.toString())
                    .setTimestamp(Date.now())
                    .setColor('#FF0000')

                client.logHook.send({ embeds: [embed] })
            }
        }

        client.readyTime = Date.now()
        client.mainGuild = await client.guilds.fetch('1276202598692818996')
        client.updateChannel = await client.channels.fetch('1276548924936814755')
        client.logHook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1276620993720225833/C4g1-L9bYl8F5r7XLViIMUoqObna7trRWOHL_MhQwLoVdza5BTTwlB9K6PdNotP2Uaar' })

        const discordTime = Math.floor(client.readyTime / 1000)

        const embed = new EmbedBuilder()
            .setTitle('Bot Online')
            .setDescription(`Bot online @ <t:${discordTime}:T>`)
            .setTimestamp(client.readyTime)
            .setColor('#05ef9d')

        await client.logHook.send({ embeds: [embed] })

        setInterval(() => client.emit('stockCheck', client), 15 * 60 * 1000)
    }
}