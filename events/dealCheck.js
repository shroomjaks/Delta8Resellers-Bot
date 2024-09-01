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

        // <div class="owl-item" style="width: 344.733px; margin-right: 10px;"><div class="col">
		// 		<a class="bf-deals-content" href="https://delta8resellers.com/brand/maui-labs/">
		// 			<div class="bf-card-header">
		// 				<h3 class="bf-card-heading mb-0">Maui Labs</h3>
		// 			</div>
		// 			<div class="bf-card-content">
		// 				<p><strong>Buy 1 Get 1 Free</strong> <br> Maui Labs Products</p>
		// 			</div>
		// 			<span class="btn btn-primary m-3 mt-auto">SHOP DEAL</span>
		// 		</a>
		// 	</div></div>
        
        const allDeals = await page.evaluate(function () {
            const owlItemActive = document.querySelectorAll('owl-item active')
            const owlItem = document.querySelectorAll('owl-item')

            // Extract href and content text for both owl-item and owl-item active

            const deals = []

            for (const item of owlItem) {
                const a = item.querySelector('a')
                const content = item.querySelector('.bf-card-content')

                deals.push({
                    url: a.href,
                    contentText: content.innerText
                })
            }

            for (const item of owlItemActive) {
                const a = item.querySelector('a')
                const content = item.querySelector('.bf-card-content')

                deals.push({
                    url: a.href,
                    contentText: content.innerText
                })
            }

            return deals
        })

        console.log(`Deal check finished, found ${allDeals.length} deals`)

        // Check if there are any new deals
        const newDeals = allDeals.filter(deal => !deals.some(d => d.url === deal.url))

        if (newDeals.length > 0) {
            console.log(`${newDeals.length} new deals found!`)

            // Notify the channel
            const dealZone = await client.channels.fetch('1279817915696152656')

            for (const deal of newDeals) {
                const message = await dealZone.send(`${deal.contentText}\n${deal.url}`)
                await message.crosspost()
            }

            // Update the database
            db.set('deals', allDeals)
        }

        await client.browser.close()
    }
}