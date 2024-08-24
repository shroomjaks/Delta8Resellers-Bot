const { BaseClient, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

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

        for (const product of products) {
            const page = await client.browser.newPage()

            await page.goto(product.url)

            const productTitle = await page.waitForSelector('.product_title', { timeout: 15000 }).catch(e => { })
            const stock = await page.waitForSelector('.stock', { timeout: 5000 }).catch(e => { })

            const stockText = await page.$eval('.stock', element => element.innerText)
            const productTitleText = await page.$eval('.product_title', element => element.innerText)

            let stocked = product.stocked

            if (!stock) {
                console.log(`${product.name} is stocked`)
                stocked = true
            } else if (stock && stockText !== 'This product is currently out of stock and unavailable.') {
                console.log(`${product.name} is stocked`)
                stocked = true
            }

            await page.close()

            console.log(`Product: ${productTitleText} Stocked: ${stocked}`)

            if (product.stocked === stocked) continue

            if (stocked === true) {
                const embed = new EmbedBuilder()
                    .setTitle(product.name)
                    .setDescription(`This product has been restocked.`)
                    .setThumbnail(product.imageUrl)
                    .setURL(product.url)
                    .setTimestamp(Date.now())
                    .setColor('#05ef9d')

                await client.updateChannel.send({ embeds: [embed] })

                const restockReminders = product.restockReminders

                for (const userId of restockReminders) {
                    const user = await client.users.fetch(userId)

                    await user.send({ embeds: [embed] })
                }
            }  else {
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
                    .setStyle(ButtonStyle.PRIMARY)

                const actionRow = new ActionRowBuilder()
                    .addComponent(reminderButton)

                await client.updateChannel.send({ embeds: [embed], components: [actionRow] })
            }

            products[products.indexOf(product)].stocked = stocked
        }

        db.set('products', products)
    }
}