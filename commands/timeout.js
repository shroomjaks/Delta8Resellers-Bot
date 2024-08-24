const { BaseInteraction, BaseClient, PermissionsBitField, ApplicationCommandOptionType, CommandInteraction, ChatInputCommandInteraction } = require('discord.js')

const parseDuration = require('parse-duration')

module.exports = {
    name: 'timeout',
    description: 'Times out a member.',
    options: [
        {
            name: 'member',
            description: 'The member to timeout.',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'duration',
            description: 'How long to timeout the member. (1d, 3 days, 10 minutes, 5m)',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'reason',
            description: 'The reason.',
            type: ApplicationCommandOptionType.String,
            required: false
        },
    ],
    permissions: [
        PermissionsBitField.Flags.ManageMessages
    ],
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {BaseClient} client 
     */
    execute: async function (interaction, client) {
        const member = interaction.options.getMember('member')
        const duration = interaction.options.getString('duration')
        const reason = interaction.options.getString('reason')

        const durationMs = parseDuration(duration)

        if (!member.manageable) return await interaction.reply({ content: 'I can\'t timeout this user!', ephemeral: true })
            
        await member.timeout({ timeout: durationMs, reason: reason })

        await interaction.reply({ content: `Successfully timed out **${member.user.username}**.` })
    }
}