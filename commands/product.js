const { ChatInputCommandInteraction, ApplicationCommandOptionType } = require('discord.js')

const uuid = require('uuid-by-string')

module.exports = {
    name: 'product',
    description: 'Adds a product to be watched in the update log channel.',
    permissions: [],
    options: [
        {
            name: 'url',
            description: 'The URL of the product.',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async function (interaction) {
        let productUrl = interaction.options.getString('url')
        productUrl = productUrl.split('?')[0]
        if (productUrl.endsWith('/')) productUrl = productUrl.slice(0, -1)

        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

        if (!urlRegex.test(productUrl)) return await interaction.reply({ content: 'Invalid URL.', ephemeral: true })
        if (!productUrl.startsWith('https://delta8resellers.com/product/')) return await interaction.reply({ content: 'Not a product URL.', ephemeral: true })

        await interaction.deferReply({ ephemeral: true })

        const page = await client.browser.newPage()

        await page.goto(productUrl, { waitUntil: 'domcontentloaded' })

        const stock = await page.$('.stock').catch(() => null)

        const productTitleText = await page.$eval('.product_title', element => element.innerText)
        const stockText = await page.$eval('.stock', element => element.innerText).catch(() => null)
        const imageUrl = await page.$eval('div.iconic-woothumbs-images__slide:nth-child(2) > img:nth-child(1)', element => element.src)

        const titleUuid = uuid(productTitleText)

        const products = client.stock.get('products')
        if (products.find(product => product.uuid === titleUuid)) {
            await page.close()
            return await interaction.editReply({ content: 'This product is already being watched.', ephemeral: true })
        }

        let stocked

        if (!stock) {
            stocked = true
        } else if (stock && stockText !== 'This product is currently out of stock and unavailable.') {
            stocked = true
        } else {
            stocked = false
        }

        console.log(`\nAdding product: ${productTitleText} Stocked: ${stocked}\n`)

        await page.close()

        client.stock.set('products',
            [
                ...products,
                {
                    uuid: titleUuid,
                    name: productTitleText,
                    url: productUrl,
                    imageUrl,
                    stocked,
                    restockReminders: [interaction.user.id],
                    allStrains: [],
                    strainStock: []
                }
            ]
        )

        await interaction.editReply({ content: `Product added for restock watching, right now this product is ${stocked ? 'in stock!' : 'out of stock. You will get a message when the product is back in stock.'}`, ephemeral: true })
    }
}