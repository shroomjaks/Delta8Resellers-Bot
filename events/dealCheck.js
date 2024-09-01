const { BaseClient } = require('discord.js')

const JSONdb = require('simple-json-db')
const db = new JSONdb('database.json')

const puppeteer = require('puppeteer-core')

module.exports = {
    event: 'dealCheck',
    once: false,
    disabled: false,
    /**
     * 
     * @param {BaseClient} client 
     */
    execute: async function (client) {
        if (!client.db) {
            client.db = db
        }

        if (!client.browser) {
            client.browser = await puppeteer.launch({
                executablePath: '/usr/bin/chromium',
                headless: true,
                args: ['--no-sandbox'],
            })
        }

        let deals = db.get('deals')

        if (!deals) {
            deals = []
            db.set('products', deals)
        }

        console.log('Checking deals...')

        const page = await client.browser.newPage()

        await page.goto('https://delta8resellers.com/', { waitUntil: 'domcontentloaded' })
        
        const allDeals = await page.evaluate(function () {
            const dealCards = document.querySelectorAll('a.bf-deals-content')

            // Extract href and content text
            return Array.from(dealCards).map(function (card) {
                const href = card.getAttribute('href')
                const contentText = card.querySelector('.bf-card-content').innerText.trim()
                return { href, contentText }
            })
        })

        console.log(allDeals)

        await client.browser.close()
    }
}