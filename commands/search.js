const { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js')

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

        const autocompleteResults = []

        for (const result of searchResults.suggestions) {
            if (result.type !== 'product') continue

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
        }

        await interaction.respond(autocompleteResults)
    },
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async function (interaction) {
        const query = interaction.options.getString('query')

        const product = search.get(query)

        if (!product) return await interaction.reply({ content: 'Product not found.', ephemeral: true })

        const embed = new EmbedBuilder()
            .setTitle(product.name)
            .setThumbnail(product.imageUrl)
            .setURL(product.url)

        await interaction.reply({ embeds: [embed] })
    }
}