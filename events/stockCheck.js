const { BaseClient } = require('discord.js')

const { JSONFilePreset } = require('lowdb')

const puppeteer = require('puppeteer-core')

module.exports = {
    event: 'stockCheck',
    once: false,
    /**
     * 
     * @param {BaseClient} client 
     */
    execute: async function (client) {
        if (!client.db) {
            client.db = await JSONFilePreset('../database.json', { posts: [] })
        }

        if (!client.browser) {
            client.browser = await puppeteer.launch({
                executablePath: '/usr/bin/chromium',
                headless: true,
                args: ['--no-sandbox'],
            })
        }

        const { products } = client.db.data

        for (const product of products) {
            const page = await client.browser.newPage()

            await page.goto(product.url)

            const stock = await page.waitForSelector('.stock', { timeout: 5000 }).catch(e => { })

            if (!stock) {
                console.log('Product not out of stock')
            } else if (stock && innerText !== 'This product is currently out of stock and unavailable.') {
                console.log('Product is not out of stock')
            }
        }
    }
}