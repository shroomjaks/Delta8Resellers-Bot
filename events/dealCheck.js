const { Client } = require('discord.js')

const { PlaywrightBlocker } = require('@ghostery/adblocker-playwright')
const fetch = require('cross-fetch')

module.exports = {
    event: 'dealCheck',
    once: false,
    disabled: false,
    /**
     * 
     * @param {Client} client 
     */
    execute: async function (client) {
        let storedDeals = client.stock.get('deals')

        console.log('\nChecking deals...')
        
        const page = await client.browser.newPage()
        const adblock = await PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch)
        await adblock.enableBlockingInPage(page)
        
        await page.goto('https://delta8resellers.com')
        
        const scrapedDeals = await page.evaluate(function () {
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
        
        console.log(`Deal check finished, found ${scrapedDeals.length} deals`)
        
        // Filter only new deals
        const newDeals = scrapedDeals.filter(deal => !storedDeals.find(d => d.url === deal.url))
        
        if (newDeals.length > 0) {
            console.log(`${newDeals.length} new deals found!`)
        
            // Notify the channel
            const dealZone = await client.channels.fetch('1279817915696152656')
        
            for (const deal of newDeals) {
                const message = await dealZone.send(`${deal.contentText}\n${deal.url}`)
                await message.crosspost()
            }
        
            // Update the database
            client.stock.set('deals', scrapedDeals)
        }
        
        await page.close()
        
    }
}