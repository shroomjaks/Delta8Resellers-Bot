const { BaseClient, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const { PlaywrightBlocker } = require('@ghostery/adblocker-playwright')
const fetch = require('cross-fetch')

const ansis = require('ansis')

const humanize = require('humanize-duration')

module.exports = {
    event: 'stockCheck',
    once: false,
    disabled: false,
    /**
     * 
     * @param {BaseClient} client 
     */
    execute: async function () {
        try {
            var startTime = Date.now()

            var products = client.stock.get('products')

            console.log('Checking stock...')

            const updateChannel = await client.channels.fetch('1276548924936814755')

            var page = await client.browser.newPage() // Reuse the same page for all products
            const adblock = await PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch)
            await adblock.enableBlockingInPage(page)

            for (const product of products) {
                console.log(`\nNavigating to ${ansis.bold(product.name)}`)

                await page.goto(product.url)

                process.stdout.write('Stocked: ')

                const isStocked = await page.evaluate(function () {
                    const stockElement = document.querySelector('.stock');
                    if (stockElement) {
                        return !stockElement.textContent.includes('This product is currently out of stock and unavailable.')
                    }
                    return true // If stock element is not found, default to stocked (true)
                })


                const oldStocked = product.stocked

                if (isStocked) {
                    process.stdout.write(ansis.greenBright('true\n'))
                } else {
                    process.stdout.write(ansis.redBright('false\n'))
                }

                product.stocked = isStocked

                // Product restock or out-of-stock status changes
                if (product.stocked === true && oldStocked === false) {
                    const embed = new EmbedBuilder()
                        .setTitle(product.name)
                        .setDescription('This entire product has been restocked! 🎉')
                        .setThumbnail(product.imageUrl)
                        .setURL(product.url)
                        .setColor('#05ef9d')

                    await updateChannel.send({ embeds: [embed] })

                    // Notify users in parallel
                    await Promise.all(product.restockReminders.map(async function (userId) {
                        const user = await client.users.fetch(userId)
                        try {
                            await user.send({ embeds: [embed] })
                        } catch (error) {
                            console.error(error)
                        }
                    }))
                } else if (product.stocked === false && oldStocked === true) {
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

                const optionSelect = await page.$('#pa_flavor') || await page.$('#pa_size')

                const stockedStrainValues = await page.$$('.attached')
                    .then(async (elements) => {
                        return await Promise.all(elements.map(async function (element) {
                            return await element.evaluate(el => el.value)
                        }))
                    })

                const stockedStrainNames = await page.$$('.attached')
                    .then(async (elements) => {
                        return await Promise.all(elements.map(async (element) => {
                            return await element.evaluate(el => el.innerText)
                        }))
                    })

                if (!stockedStrainValues) {
                    console.log(ansis.red('No strains found'))
                    continue
                }

                // Handle each strain
                for (const strainValue of stockedStrainValues) {
                    await optionSelect.selectOption({ value: strainValue })

                    const strainStock = await page.$eval('.stock', el => el.innerText)
                    const strainImage = await page.$eval('.iconic-woothumbs-images__image', el => el.src)

                    const strainStockAmount = parseInt(strainStock.match(/\d+/g))
                    const strainName = stockedStrainNames[stockedStrainValues.indexOf(strainValue)]
                    const dbStock = product.strainStock.find(strain => strain.strainValue === strainValue)

                    console.log(`${ansis.bold(strainName)}: ${ansis.greenBright(strainStockAmount)}`)

                    if (!dbStock) {
                        console.log(ansis.red(`No stock for ${strainValue}`))
                        continue
                    }
                    if (!dbStock.imageUrl) dbStock.imageUrl = strainImage

                    dbStock.stock = strainStockAmount

                    if (dbStock.stock === 0 && strainStockAmount > 1) {
                        console.log(`${ansis.bold(strainName)} is now in stock.`)

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
                    console.log(`${ansis.bold(strain.strainName)}: ${ansis.redBright('0')}`)

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

            var endTime = Date.now()
        } catch (error) {
            console.error(error)
        } finally {
            await page.close()

            client.stock.set('products', products)
            console.log(`\nStock check complete. Time taken: ${humanize(endTime - startTime)}`)
        }
    }
}