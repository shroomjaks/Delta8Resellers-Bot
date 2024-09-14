const { Client } = require('discord.js')

module.exports = {
    event: 'dealCheck',
    once: false,
    disabled: false,
    /**
     * 
     * @param {Client} client 
     */
    execute: async function (client) {
        let deals = client.stock.get('deals')

        if (!deals) {
            deals = []
            client.stock.set('products', deals)
        }

        console.log('Checking deals...')

        const page = await client.browser.newPage()

        await page.goto('https://delta8resellers.com/', { waitUntil: 'domcontentloaded' })

        const allDeals = await page.evaluate(function () {
            let deals = []

            const dealCards = document.querySelectorAll('.owl-item, .owl-item.active')

            for (const dealCard of dealCards) {
                const contentText = dealCard.querySelector('.bf-card-content')
                const url = dealCard.querySelector('.bf-deals-content')

                if (!contentText || !url) continue

                deals.push({
                    contentText: contentText.innerText,
                    url: url.href
                })
            }

            // Filter duplicates before returning
            deals = deals.filter((deal, index, self) => self.findIndex(d => d.url === deal.url) === index)

            return deals
        })

        console.log(`Deal check finished, found ${allDeals.length} deals`)

        // Filter only new deals
        const newDeals = allDeals.filter(deal => !deals.find(d => d.url === deal.url))

        if (newDeals.length > 0) {
            console.log(`${newDeals.length} new deals found!`)

            // Notify the channel
            const dealZone = await client.channels.fetch('1279817915696152656')

            for (const deal of newDeals) {
                const message = await dealZone.send(`${deal.contentText}\n${deal.url}`)
                await message.crosspost()
            }

            // Update the database
            client.stock.set('deals', allDeals)
        }

        await page.close()
    }
}