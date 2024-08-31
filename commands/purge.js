const { EmbedBuilder, ApplicationCommandOptionType, PermissionsBitField, ChatInputCommandInteraction, Client } = require('discord.js')

module.exports = {
    name: 'purge',
    description: 'Purges defined amount of messages in a channel.',
    options: [
        {
            name: 'amount',
            description: 'The amount of messages to delete.',
            type: ApplicationCommandOptionType.Integer,
            required: true
        },
        {
            name: 'channel',
            description: 'Defaults to the current channel.',
            type: ApplicationCommandOptionType.Channel,
            required: true
        }
    ],
    permissions: [
        PermissionsBitField.Flags.ManageMessages
    ],
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client 
     */
    execute: async function (interaction, client) {
        const amount = interaction.options.getInteger('amount')
        const channel = interaction.options.getChannel('channel') || interaction.channel

        await channel.bulkDelete(amount)

        await interaction.reply({ content: `Successfully deleted **${amount}** messages.`, ephemeral: true })
    }
}