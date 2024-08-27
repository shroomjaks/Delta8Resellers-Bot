require('dotenv').config()

const { Client, GatewayIntentBits, EmbedBuilder, Events } = require('discord.js')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessageReactions
    ]
})

const ready = require('./events/ready')
client.on(Events.ClientReady, () => ready.execute(client))

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