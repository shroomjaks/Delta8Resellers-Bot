const { EmbedBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction, BaseClient } = require('discord.js')

module.exports = {
    name: 'product',
    description: 'Adds a product to be watched in the update log channel.',
    options: [
        {
            'name': 'url',
            'description': 'The URL of the product.',
            'type': ApplicationCommandOptionType.String,
            'required': true
        }
    ],
    permissions: [],
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {BaseClient} client 
     */
    execute: async function (interaction, client) {
        let productUrl = interaction.options.getString('url')
        productUrl = productUrl.split('?')[0]

        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

        if (!urlRegex.test(productUrl)) return await interaction.reply({ content: 'Invalid URL.', ephemeral: true })
        if (!productUrl.startsWith('https://delta8resellers.com/product/')) return await interaction.reply({ content: 'Not a product URL.', ephemeral: true })

        await interaction.deferReply({ ephemeral: true })

        const page = await client.browser.newPage()

        console.log(productUrl)

        await page.goto(productUrl)

        const productTitle = await page.waitForSelector('.product_title', { timeout: 60000 }).catch(e => { })
        const stock = await page.waitForSelector('.stock', { timeout: 60000 }).catch(e => { })
        const image = await page.waitForSelector('div.iconic-woothumbs-images__slide:nth-child(2) > img:nth-child(1)')

        const productTitleText = await page.$eval('.product_title', element => element.innerText)
        const stockText = await page.$eval('.stock', element => element.innerText)
        const imageUrl = await page.$eval('div.iconic-woothumbs-images__slide:nth-child(2) > img:nth-child(1)', element => element.src)

        let stocked = false

        if (!stock) {
            stocked = true
        } else if (stock && stockText !== 'This product is currently out of stock and unavailable.') {
            stocked = true
        }

        console.log(`Product: ${productTitleText} Stocked: ${stocked}`)

        await page.close()

        client.db.set('products', 
            [
                ...client.db.get('products'), 
                { 
                    name: productTitleText, 
                    url: productUrl, 
                    stocked, 
                    imageUrl, 
                    restockReminder: [interaction.user.id] 
                }
            ]
        )

        await interaction.editReply({ content: `Product added for restock watching, right now this product is ${stocked ? 'in stock!' : 'out of stock.'} You will get a ping when the product is back in stock.`, ephemeral: true })
    }
}