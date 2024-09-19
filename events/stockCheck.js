const { BaseClient, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    event: 'stockCheck',
    once: false,
    disabled: false,
    /**
     * 
     * @param {BaseClient} client 
     */
    execute: async function (client) {
        let products = client.stock.get('products')

        console.log('Checking stock...')

        const updateChannel = await client.channels.fetch('1276548924936814755')

        for (const product of products) {
            const page = await client.browser.newPage()

            await page.goto(product.url, { waitUntil: 'domcontentloaded' })

            const stock = await page.$('.stock').catch(() => null)
            const stockText = await page.$eval('.stock', element => element.innerText).catch(() => null)
            const productTitleText = await page.$eval('.product_title', element => element.innerText)

            // Get option elements under #pa_flavor, excluding no value options
            const stockedStrainValues = await page.$$eval('#pa_flavor option', elements => elements.map(element => element.value).filter(value => value !== ''))
            const stockedStrainNames = await page.$$eval('#pa_flavor option', elements => elements.map(element => element.innerText).filter(name => name !== 'Choose an option'))

            const unstockedStrains = product.allStrains.filter(strain => !stockedStrainValues.includes(strain.strainValue))

            const oldStocked = product.stocked

            if (!stock) {
                product.stocked = true
            } else if (stock && stockText !== 'This product is currently out of stock and unavailable.') {
                product.stocked = true
            } else {
                product.stocked = false
            }

            console.info(`Product: ${productTitleText} Stocked: ${product.stocked}`)

            for (const strainValue of stockedStrainValues) {
                await page.select('#pa_flavor', strainValue)

                // Get .stock element text
                const strainStock = await page.$eval('.stock', element => element.innerText).catch(() => null)
                const strainStockAmount = parseInt(strainStock.match(/\d+/g))
                const strainImage = await page.$eval('.iconic-woothumbs-images__image', element => element.src).catch(() => null)

                console.log(`Strain: ${stockedStrainNames[stockedStrainValues.indexOf(strainValue)]}, Amount: ${strainStockAmount}`)

                const dbStock = product.strainStock.find(strain => strain.strainValue === strainValue)

                dbStock.imageUrl = strainImage

                if (dbStock.stock === strainStockAmount) continue

                if (dbStock.stock === 0 && strainStockAmount > 1) {
                    const embed = new EmbedBuilder()
                        .setTitle(product.name)
                        .setDescription(`Strain "${stockedStrainNames[stockedStrainValues.indexOf(strainValue)]}" is now in stock. 🎉`)
                        .setThumbnail(dbStock.imageUrl)
                        .setURL(product.url)
                        .setTimestamp(Date.now())
                        .setColor('#05ef9d')

                    const message = await updateChannel.send({ embeds: [embed] })
                    await message.crosspost()

                    for (const userId of dbStock.restockReminders) {
                        const user = await client.users.fetch(userId)

                        try {
                            await user.send({ embeds: [embed] })
                        } catch (error) {
                            console.error(error)
                        }
                    }

                    dbStock.sendLimitedStockWarning = false
                } else if (strainStockAmount <= 10 && dbStock.sendLimitedStockWarning === false) {
                    const embed = new EmbedBuilder()
                        .setTitle(product.name)
                        .setDescription(`Only 10 "${stockedStrainNames[stockedStrainValues.indexOf(strainValue)]}" left! ⚠️`)
                        .setThumbnail(dbStock.imageUrl)
                        .setURL(product.url)
                        .setTimestamp(Date.now())
                        .setColor('#FFA500')

                    const message = await updateChannel.send({ embeds: [embed] })
                    await message.crosspost()
                }

                dbStock.stock = strainStockAmount
            }

            for (const strain of unstockedStrains) {
                const dbStock = product.strainStock.find(dbStrain => dbStrain.strainValue === strain.strainValue)

                console.log(`Strain: ${strain.strainName}, Amount: 0`)

                if (dbStock.stock === 0) continue 

                dbStock.stock = 0

                const embed = new EmbedBuilder()
                    .setTitle(product.name)
                    .setDescription(`Strain "${strain.strainName}" is now out of stock. 😢`)
                    .setThumbnail(strain.imageUrl)
                    .setURL(product.url)
                    .setTimestamp(Date.now())
                    .setColor('#FF0000')
                    .setFooter({ text: 'Press the button below to be reminded when this strain is restocked.' })

                const reminderButton = new ButtonBuilder()
                    .setCustomId(`strain:${strain.strainValue}`)
                    .setLabel('Remind Me')
                    .setStyle(ButtonStyle.Primary)

                const actionRow = new ActionRowBuilder()
                    .addComponents(reminderButton)

                const message = await updateChannel.send({ embeds: [embed], components: [actionRow] })
                await message.crosspost()
            }

            await page.close()

            if (oldStocked === product.stocked) continue

            if (product.stocked === true) {
                const embed = new EmbedBuilder()
                    .setTitle(product.name)
                    .setDescription(`This entire product has been restocked! 🎉`)
                    .setThumbnail(product.imageUrl)
                    .setURL(product.url)
                    .setTimestamp(Date.now())
                    .setColor('#05ef9d')

                const message = await updateChannel.send({ embeds: [embed] })
                await message.crosspost()

                for (const userId of product.restockReminders) {
                    const user = await client.users.fetch(userId)

                    try {
                        await user.send({ embeds: [embed] })
                    } catch (error) {
                        console.error(error)
                    }
                }
            } else {
                const embed = new EmbedBuilder()
                    .setTitle(product.name)
                    .setDescription(`This entire product is now out of stock. 😢`)
                    .setThumbnail(product.imageUrl)
                    .setURL(product.url)
                    .setTimestamp(Date.now())
                    .setColor('#FF0000')
                    .setFooter({ text: 'Press the button below to be reminded when this product is restocked.' })

                const reminderButton = new ButtonBuilder()
                    .setCustomId(`product:${product.uuid}`)
                    .setLabel('Remind Me')
                    .setStyle(ButtonStyle.Primary)

                const actionRow = new ActionRowBuilder()
                    .addComponents(reminderButton)

                const message = await updateChannel.send({ embeds: [embed], components: [actionRow] })
                await message.crosspost()
            }
        }

        client.stock.set('products', products)

        console.log('Stock check complete.\n')
    }
}