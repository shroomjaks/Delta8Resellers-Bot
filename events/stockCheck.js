const { BaseClient, BaseInteraction } =  require('discord.js')

const pocketbase = require('pocketbase')

module.exports = {
    event: 'stockCheck',
    once: false,
    /**
     * 
     * @param {BaseClient} client 
     */
    execute: async function (client) {
        const page = await client.browser.newPage()
        
        await page.goto('https://delta8resellers.com/product/fvkd-exotics-thc-a-rosin-disposable-3-5g/')
    }
}