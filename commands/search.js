const { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction } = require('discord.js')

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

            const urlMatch = result.thumb_html.match(/src="([^"]+)"/);
            const imageUrl = urlMatch ? urlMatch[1] : nul

            if (search.has(result.post_id)) continue

            search.set(result.post_id, {
                name: result.value,
                url: result.url,
                imageUrl: imageUrl
            })

            autocompleteResults.push({
                name: result.value,
                value: `search:${result.post_id}`
            })
        }

        await interaction.respond(autocompleteResults)
    },
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async function (interaction) {

    }
}