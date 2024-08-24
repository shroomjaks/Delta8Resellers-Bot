require('dotenv').config()

const { Client, GatewayIntentBits } = require('discord.js')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
})

const fs = require('fs')
const path = require('path')

const commandsFolder = fs.readdirSync('./commands')
const eventsFolder = fs.readdirSync('./events')

client.commands = []

for (const commandFile of commandsFolder) {
    const command = require(path.join(__dirname, 'commands', commandFile))

    client.commands.push(command)
}

for (const eventFile of eventsFolder) {
    const event = require(path.join(__dirname, 'events', eventFile))

    if (event?.disabled) return

    try {
        if (event.once) {
            client.once(event.event, (...args) => event.execute(...args, client))
        } else {
            client.on(event.event, (...args) => event.execute(...args, client))
        }
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

// Call stockCheck every 10 minutes
client.emit('stockCheck', client)
setInterval(() => client.emit('stockCheck', client), 10 * 60 * 1000)

client.login(process.env.TOKEN)

process.on('unhandledRejection', function (error) {
    console.error(error)
    
    const embed = new EmbedBuilder()
        .setTitle('Unhandled Rejection')
        .setDescription(error.toString())
        .setTimestamp(Date.now())
        .setColor('#FF0000')

    client.logHook.send({ embeds: [embed] })
})