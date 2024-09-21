const { ChatInputCommandInteraction, ApplicationCommandOptionType } = require('discord.js')

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
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async function (interaction) {
        
    }
}