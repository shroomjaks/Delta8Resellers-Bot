const { Events, Client } = require('discord.js')

const JSONdb = require('simple-json-db')

const stock = new JSONdb('./database/stock.json')
const xp = new JSONdb('./database/xp.json')

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
        // Set the time the client was ready and log it
        client.readyTime = Date.now()
        client.log.online(Date.now())

        // Add a check reaction to the verify message to cache it for later
        const verifyChannel = await client.channels.fetch('1276212096601686067')
        const verifyMessage = await verifyChannel.messages.fetch('1277129869565759510')
        await verifyMessage.react('✅')

        // Start 60 minute stock and 2 hour deal checks
        setInterval(() => client.emit('stockCheck', client), 60 * 60 * 1000)
        setInterval(() => client.emit('dealCheck', client), 120 * 60 * 1000)

        // Set the global variables to be accessed from eval
        globalThis['client'] = client
        globalThis['require'] = require

        client.stock = stock
        client.xp = xp

        client.browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium',
            headless: true,
            args: ['--no-sandbox'],
        })

        console.log(`Logged in as ${client.user.username}`)
    }
}