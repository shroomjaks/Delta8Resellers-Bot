const { Events, Client, EmbedBuilder } = require('discord.js')

const JSONdb = require('simple-json-db')

const stock = new JSONdb('./database/stock.json')
const xp = new JSONdb('./database/xp.json')

const { chromium } = require('playwright')

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

        setInterval(() => client.emit('stockCheck', client), 60 * 60 * 1000)
        setInterval(() => client.emit('redditCheck'), 30 * 30 * 1000)
        setInterval(() => client.emit('dealCheck', client), 360 * 60 * 1000)

        // Set the global variables to be accessed from eval
        globalThis['client'] = client
        globalThis['require'] = require
        globalThis['EmbedBuilder'] = EmbedBuilder

        client.stock = stock
        client.xp = xp

        client.browser = await chromium.launch({ 
            executablePath: '/usr/bin/chromium',
            headless: true
        })

        console.log(`Logged in as ${client.user.username}`)
    }
}