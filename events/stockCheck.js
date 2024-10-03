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

        try {
            var page = await client.browser.newPage() // Reuse the same page for all products

            for (const product of products) {
                await page.goto(product.url, { waitUntil: 'domcontentloaded' })

                // Collect stock and strain info
                const [stock, stockText, stockedStrainValues, stockedStrainNames] = await Promise.all([
                    page.$('.stock').catch(() => null),
                    page.$eval('.stock', el => el.innerText).catch(() => null),
                    page.$$eval('#pa_flavor option', el => el.map(e => e.value).filter(v => v !== '')).catch(() => null),
                    page.$$eval('#pa_flavor option', el => el.map(e => e.innerText).filter(n => n !== 'Choose an option')).catch(() => null)
                ])

                const oldStocked = product.stocked

                if (!stock) {
                    // If no stock element is found, assume it's in stock (or handle it as you prefer)
                    product.stocked = true
                } else if (stockText && !stockText.includes('This product is currently out of stock and unavailable.')) {
                    // If stockText is found and it's not the "out of stock" message, mark it as stocked
                    product.stocked = true
                } else {
                    // Otherwise, mark it as out of stock
                    product.stocked = false
                }

                // Product restock or out-of-stock status changes
                if (product.stocked && !oldStocked) {
                    const embed = new EmbedBuilder()
                        .setTitle(product.name)
                        .setDescription('This entire product has been restocked! 🎉')
                        .setThumbnail(product.imageUrl)
                        .setURL(product.url)
                        .setColor('#05ef9d')

                    await updateChannel.send({ embeds: [embed] })

                    // Notify users in parallel
                    await Promise.all(product.restockReminders.map(async (userId) => {
                        const user = await client.users.fetch(userId)
                        try {
                            await user.send({ embeds: [embed] })
                        } catch (error) {
                            console.error(error)
                        }
                    }))
                } else if (!product.stocked && oldStocked) {
                    const embed = new EmbedBuilder()
                        .setTitle(product.name)
                        .setDescription('This entire product is now out of stock. 😢')
                        .setThumbnail(product.imageUrl)
                        .setURL(product.url)
                        .setColor('#FF0000')
                        .setFooter({ text: 'Press the button below to be reminded when this product is restocked.' })

                    const reminderButton = new ButtonBuilder()
                        .setCustomId(`product:${product.uuid}`)
                        .setLabel('Remind Me')
                        .setStyle(ButtonStyle.Primary)

                    const actionRow = new ActionRowBuilder().addComponents(reminderButton)
                    await updateChannel.send({ embeds: [embed], components: [actionRow] })
                }

                // Handle each strain
                for (const strainValue of stockedStrainValues) {
                    await page.select('#pa_flavor', strainValue)

                    const [strainStock, strainImage] = await Promise.all([
                        page.$eval('.stock', el => el.innerText).catch(() => null),
                        page.$eval('.iconic-woothumbs-images__image', el => el.src).catch(() => null)
                    ])

                    const strainStockAmount = parseInt(strainStock.match(/\d+/g))
                    const strainName = stockedStrainNames[stockedStrainValues.indexOf(strainValue)]
                    const dbStock = product.strainStock.find(strain => strain.strainValue === strainValue)

                    if (!dbStock) continue

                    dbStock.stock = strainStockAmount

                    if (!dbStock.imageUrl) dbStock.imageUrl = strainImage

                    console.log(`Strain: ${strainName}, Amount: ${strainStockAmount}`)

                    if (dbStock.stock === 0 && strainStockAmount > 1) {
                        const embed = new EmbedBuilder()
                            .setTitle(product.name)
                            .setDescription(`*${strainName}* is now in stock. 🎉`)
                            .setThumbnail(dbStock.imageUrl)
                            .setURL(`${product.url}?attribute_pa_flavor=${strainValue}`)
                            .setColor('#05ef9d')

                        await updateChannel.send({ embeds: [embed] })

                        await Promise.all(dbStock.restockReminders.map(async (userId) => {
                            const user = await client.users.fetch(userId)
                            try {
                                await user.send({ embeds: [embed] })
                            } catch (error) {
                                console.error(error)
                            }
                        }))

                        dbStock.sentLimitedStockWarning = false
                    } else if (strainStockAmount <= 10 && !dbStock.sentLimitedStockWarning) {
                        const embed = new EmbedBuilder()
                            .setTitle(product.name)
                            .setDescription(`Only **${strainStockAmount}** *${strainName}* left! ⚠️`)
                            .setThumbnail(dbStock.imageUrl)
                            .setURL(`${product.url}?attribute_pa_flavor=${strainValue}`)
                            .setColor('#FFA500')

                        await updateChannel.send({ embeds: [embed] })

                        dbStock.sentLimitedStockWarning = true
                    }
                }

                const unstockedStrains = product.allStrains.filter(strain => !stockedStrainValues.includes(strain.strainValue))

                // Handle unstocked strains
                for (const strain of unstockedStrains) {
                    const dbStock = product.strainStock.find(dbStrain => dbStrain.strainValue === strain.strainValue)

                    if (dbStock.stock === 0) continue

                    dbStock.stock = 0

                    if (!product.stocked) continue

                    const embed = new EmbedBuilder()
                        .setTitle(product.name)
                        .setDescription(`*${strain.strainName}* is now out of stock. 😢`)
                        .setThumbnail(dbStock.imageUrl)
                        .setURL(`${product.url}?attribute_pa_flavor=${strain.strainValue}`)
                        .setColor('#FF0000')
                        .setFooter({ text: 'Press the button below to be reminded when this strain is restocked.' })

                    const reminderButton = new ButtonBuilder()
                        .setCustomId(`strain:${strain.strainValue}`)
                        .setLabel('Remind Me')
                        .setStyle(ButtonStyle.Primary)

                    const actionRow = new ActionRowBuilder().addComponents(reminderButton)
                    await updateChannel.send({ embeds: [embed], components: [actionRow] })
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            await page.close()
            client.stock.set('products', products)
            console.log('Stock check complete.\n')
        }
    }
}