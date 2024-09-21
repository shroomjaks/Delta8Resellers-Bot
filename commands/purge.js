const { ChatInputCommandInteraction, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js')

module.exports = {
    name: 'purge',
    description: 'Purges defined amount of messages in a channel.',
    permissions: [
        PermissionsBitField.Flags.ManageMessages
    ],
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
            required: false
        }
    ],
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async function (interaction) {
        const amount = interaction.options.getInteger('amount')
        const channel = interaction.options.getChannel('channel') || interaction.channel

        if (amount < 1) return await interaction.reply({ content: 'Amount cannot be less than 1.', ephemeral: true })
        if (amount > 100) return await interaction.reply({ content: 'Amount cannot be greater than 100.', ephemeral: true })

        await channel.bulkDelete(amount)

        await interaction.reply({ content: `Successfully deleted **${amount}** messages.`, ephemeral: true })
    }
}