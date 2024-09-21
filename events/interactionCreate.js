const { Events, BaseInteraction } = require('discord.js')

module.exports = {
    event: Events.InteractionCreate,
    once: false,
    disabled: false,
    /**
     * 
     * @param {BaseInteraction} interaction 
     */
    execute: async function (interaction) {
        client.log.text(`**${interaction.user.username}** used **${interaction.commandName}**`)

        const chatInputEvent = require('./interactions/chatInputCommand')
        const buttonEvent = require('./interactions/button')
        const autocompleteEvent = require('./interactions/autocomplete')

        switch(interaction) {
            case isChatInputCommand():
                chatInputEvent.execute(interaction)
                break
            case isAutocomplete():
                autocompleteEvent.execute(interaction)
                break
            case isButton():
                buttonEvent.execute(interaction)
                break
        }
    }
}