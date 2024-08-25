const { BaseClient, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } = require('discord.js')

const JSONdb = require('simple-json-db')
const db = new JSONdb('database.json')

const puppeteer = require('puppeteer-core')

module.exports = {
    event: 'stockCheck',
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

        let products = db.get('products')

        if (!products) {
            products = []
            db.set('products', products)
        }

        console.log('Checking stock...')

        for (const product of products) {
            const page = await client.browser.newPage()

            await page.goto(product.url, { waitUntil: 'domcontentloaded' })

            const stock = await page.$('.stock').catch(() => null)

            const stockText = await page.$eval('.stock', element => element.innerText).catch(() => null)
            const productTitleText = await page.$eval('.product_title', element => element.innerText)

            let stocked = product.stocked

            if (!stock) {
                stocked = true
            } else if (stock && stockText !== 'This product is currently out of stock and unavailable.') {
                stocked = true
            }

            await page.close()

            console.info(`Product: ${productTitleText} Stocked: ${stocked}`)

            if (product.stocked === stocked) continue

            if (stocked === true) {
                const embed = new EmbedBuilder()
                    .setTitle(product.name)
                    .setDescription(`This product has been restocked.`)
                    .setThumbnail(product.imageUrl)
                    .setURL(product.url)
                    .setTimestamp(Date.now())
                    .setColor('#05ef9d')

                const message = await client.updateChannel.send({ embeds: [embed] })
                await message.crosspost()

                for (const userId of product.restockReminders) {
                    const user = await client.users.fetch(userId)

                    await user.send({ embeds: [embed] })
                }
            } else {
                const embed = new EmbedBuilder()
                    .setTitle(product.name)
                    .setDescription(`This product is now out of stock.`)
                    .setThumbnail(product.imageUrl)
                    .setURL(product.url)
                    .setTimestamp(Date.now())
                    .setColor('#FF0000')
                    .setFooter({ text: 'Press the button below to be reminded when this product is restocked.' })

                const reminderButton = new ButtonBuilder()
                    .setCustomID(product.uuid)
                    .setLabel('Remind Me')
                    .setStyle(ButtonStyle.Primary)

                const actionRow = new ActionRowBuilder()
                    .addComponent(reminderButton)

                const message = await client.updateChannel.send({ embeds: [embed], components: [actionRow] })
                await message.crosspost()
            }

            products[products.indexOf(product)].stocked = stocked
        }

        db.set('products', products)

        console.log('Stock check complete.\n')
    }
}