const { Events, Client } = require('discord.js')

const JSONdb = require('simple-json-db')
const db = new JSONdb('database.json')

const puppeteer = require('puppeteer-core')

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

        // Set the time the client was ready and log it
        client.readyTime = Date.now()
        client.log.online(Date.now())

        // Set the main guild and update channel
        client.mainGuild = await client.guilds.fetch('1276202598692818996')
        client.updateChannel = await client.channels.fetch('1276548924936814755')

        // Add a check reaction to the verify message to cache it for later
        const verifyChannel = await client.channels.fetch('1276212096601686067')
        const verifyMessage = await verifyChannel.messages.fetch('1277129869565759510')
        await verifyMessage.react('✅')

        // Start 15 minute stock and 2 hour deal checks
        setInterval(() => client.emit('stockCheck', client), 15 * 60 * 1000)
        setInterval(() => client.emit('dealCheck', client), 120 * 60 * 1000)

        // Set the global client so it can be accessed from eval
        globalThis['client'] = client

        client.db = db

        client.browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium',
            headless: true,
            args: ['--no-sandbox'],
        })

        // client.emit('stockCheck', client)
    }
}