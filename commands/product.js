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
        let productUrl = interaction.options.getString('url')?.split('?')[0].replace(/\/$/, '')

        // Validate the URL format and the domain
        const urlRegex = /^https:\/\/(www\.)?delta8resellers\.com\/product\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*$/

        if (!urlRegex.test(productUrl)) {
            return await interaction.reply({ content: 'Invalid or not a product URL.', ephemeral: true })
        }

        await interaction.deferReply({ ephemeral: true })

        const page = await client.browser.newPage()
        await page.goto(productUrl, { waitUntil: 'domcontentloaded' })

        const productTitleText = await page.$eval('.product_title', el => el.innerText)
        const stockText = await page.$eval('.stock', el => el.innerText).catch(() => null)
        const imageUrl = await page.$eval('div.iconic-woothumbs-images__slide:nth-child(2) > img', el => el.src)

        const titleUuid = uuid(productTitleText)
        const products = client.stock.get('products')
        if (products.some(product => product.uuid === titleUuid)) {
            await page.close()

            return await interaction.editReply({ content: 'This product is already being watched.', ephemeral: true })
        }

        // Determine stock status
        if (!stock) {
            stocked = true
        } else if (stock && stockText !== 'This product is currently out of stock and unavailable.') {
            stocked = true
        } else {
            stocked = false
        }

        console.log(`\nAdding product: ${productTitleText} Stocked: ${stocked}\n`)

        await page.close()

        // Add product to the stock list
        client.stock.set('products', [
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
        ])

        await interaction.editReply({
            content: `Product added for restock watching, right now this product is ${stocked ? 'in stock!' : 'out of stock. You will get a message when the product is back in stock.'}`,
            ephemeral: true
        })

    }
}