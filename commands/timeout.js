const { ChatInputCommandInteraction, PermissionsBitField, ApplicationCommandOptionType } = require('discord.js')

const parseDuration = require('parse-duration')
const humanizeDuration = require('humanize-duration')

module.exports = {
    name: 'timeout',
    description: 'Timeouts a member.',
    permissions: [
        PermissionsBitField.Flags.ManageMessages
    ],
    options: [
        {
            name: 'member',
            description: 'The member to timeout.',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'duration',
            description: '(1d, 3 days, 10 minutes, 5m)',
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
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async function (interaction) {
        const member = interaction.options.getMember('member')
        const duration = interaction.options.getString('duration')
        const reason = interaction.options.getString('reason')

        const durationMs = parseDuration(duration)
        const durationHuman = humanizeDuration(durationMs)

        if (!member.manageable) return await interaction.reply({ content: 'I can\'t timeout this user!', ephemeral: true })
        if (interaction.member === member) return await interaction.reply({ content: 'You can\'t timeout yourself!', ephemeral: true })

        await member.timeout(durationMs, reason)

        await interaction.reply({ content: `Successfully timed out **${member.user.username}** for **${durationHuman}**.` })
    }
}