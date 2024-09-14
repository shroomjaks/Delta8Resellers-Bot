const { Client, GatewayIntentBits } = require('discord.js')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ]
})

const fs = require('fs')
const path = require('path')

const commandsFolder = fs.readdirSync(path.join(__dirname,  'commands'))
const eventsFolder = fs.readdirSync(path.join(__dirname, 'events'))

client.commands = []
client.events = []

client.log = require('./utils/log')

for (const commandFile of commandsFolder) {
    const command = require(path.join(__dirname, 'commands', commandFile))

    client.commands.push(command)
}

for (const eventFile of eventsFolder) {
    const event = require(path.join(__dirname, 'events', eventFile))

    client.events.push(event)

    if (event?.disabled) continue

    try {
        if (event.once) {
            client.once(event.event, (...args) => event.execute(...args, client))
        } else {
            client.on(event.event, (...args) => event.execute(...args, client))
        }
    } catch (error) {
        client.log.error(error)
    }
}

client.login(process.env.TOKEN)

process.on('unhandledRejection', function (error) {
    client.log.error(error)
})

process.on('uncaughtException', function (error) {
    client.log.error(error)
})