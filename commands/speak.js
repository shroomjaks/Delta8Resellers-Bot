const { ChatInputCommandInteraction, Client, PermissionsBitField, ApplicationCommandOptionType } = require('discord.js')

module.exports = {
    name: 'speak',
    description: 'Sends and signs a message.',
    permissions: [
        PermissionsBitField.Flags.ManageMessages
    ],
    options: [
        {
            name: 'text',
            description: 'The text to speak.',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'signature',
            description: 'The signature to use.',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'channel',
            description: 'The channel to send the message to, defaults to the current channel.',
            type: ApplicationCommandOptionType.Channel,
            required: false
        }
    ],
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async function (interaction) {
        let text = interaction.options.getString('text')
        const signature = interaction.options.getString('signature')
        const channel = interaction.options.getChannel('channel') || interaction.channel

        if (signature) {
            text += `\n\n- ${signature}`
        }

        const message = await channel.send({ content: text.toString() })

        await interaction.reply({ content: `${message.url}`, ephemeral: true })
    }
}