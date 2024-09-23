const { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')

const JSONdb = require('simple-json-db')

const search = new JSONdb('./database/search.json')

module.exports = {
    name: 'search',
    description: 'Searches for a product on Delta8Resellers.',
    permissions: [],
    options: [
        {
            name: 'query',
            description: 'The query to search.',
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ],
    /**
     * 
     * @param {AutocompleteInteraction} interaction 
     */
    autocomplete: async function (interaction) {
        const focusedValue = interaction.options.getFocused()

        const response = await fetch(`https://delta8resellers.com/?wc-ajax=dgwt_wcas_ajax_search&s=${focusedValue}`)
        const searchResults = await response.json()

        console.log(searchResults.suggestions)

        if (searchResults.suggestions.length < 1) {
            await interaction.respond([
                {
                    name: 'No results',
                    value: 'noresults'
                }
            ])
        }

        const autocompleteResults = []

        for (const result of searchResults.suggestions) {
            if (result.type === 'product') {

                const urlMatch = result.thumb_html.match(/src="([^"]+)"/)
                const imageUrl = urlMatch ? urlMatch[1] : null

                autocompleteResults.push({
                    name: result.value,
                    value: result.post_id.toString()
                })

                if (search.has(result.post_id)) continue

                search.set(result.post_id, {
                    name: result.value,
                    url: result.url,
                    imageUrl: imageUrl
                })
            } else if (result.type === 'more_products') {
                autocompleteResults.push({
                    name: 'See all products',
                    value: result.url
                })
            }
        }

        await interaction.respond(autocompleteResults)
    },
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async function (interaction) {
        const query = interaction.options.getString('query')

        if (query === 'noresults') return await interaction.reply({ content: 'No results.', ephemeral: true })

        if (query.startsWith('https://delta8resellers.com')) {
            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('See all products')
                .setURL(query)

            const row = new ActionRowBuilder()
                .addComponents(button)

            return await interaction.reply({ components: [row] })
        }

        const product = search.get(query)

        if (!product) return await interaction.reply({ content: 'Product not found.', ephemeral: true })

        const embed = new EmbedBuilder()
            .setTitle(product.name)
            .setThumbnail(product.imageUrl)
            .setURL(product.url)

        await interaction.reply({ embeds: [embed] })
    }
}