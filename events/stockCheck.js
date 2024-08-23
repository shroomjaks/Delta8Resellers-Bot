const { BaseClient, BaseInteraction } =  require('discord.js')

const PocketBase = require('pocketbase/cjs')
const pb = new PocketBase('http://127.0.0.1:8090')

const puppeteer = require('puppeteer-core')

module.exports = {
    event: 'stockCheck',
    once: false,
    /**
     * 
     * @param {BaseClient} client 
     */
    execute: async function (client) {
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium',
            headless: true,
            args: ['--no-sandbox'],
        })

        const page = await browser.newPage()
        
        await page.goto('https://delta8resellers.com/product/fvkd-exotics-thc-a-rosin-disposable-3-5g/')
    }
}