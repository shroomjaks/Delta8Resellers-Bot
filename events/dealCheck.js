const { Client } = require('discord.js')

const JSONdb = require('simple-json-db')
const db = new JSONdb('database.json')

const puppeteer = require('puppeteer-core')

module.exports = {
    event: 'dealCheck',
    once: false,
    disabled: false,
    /**
     * 
     * @param {Client} client 
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
                const url = card.getAttribute('href')
                const contentText = card.querySelector('.bf-card-content').innerText.trim()
                return { url, contentText }
            })
        })

        console.log('Deal check finished.')

        // Check if there are any new deals
        const newDeals = allDeals.filter(function (deal) {
            return !deals.some(function (oldDeal) {
                return oldDeal.url === deal.url
            })
        })

        if (newDeals.length > 0) {
            console.log('New deals found!')

            // Notify the channel
            const dealZone = await client.channels.fetch('1279817915696152656')

            for (const deal of newDeals) {
                await dealZone.send(`${deal.contentText}\n${deal.url}`)
            }

            // Update the database
            db.set('deals', allDeals)
        }

        await client.browser.close()
    }
}