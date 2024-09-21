const { BaseInteraction, BaseClient, PermissionsBitField, ApplicationCommandOptionType, CommandInteraction, ChatInputCommandInteraction } = require('discord.js')

module.exports = {
    name: 'kick',
    description: 'Kicks a member.',
    permissions: [
        PermissionsBitField.Flags.KickMembers
    ],
    options: [
        {
            name: 'member',
            description: 'The member to kick.',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'reason',
            description: 'The reason.',
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {BaseClient} client 
     */
    execute: async function (interaction, client) {
        const member = interaction.options.getMember('member')
        const reason = interaction.options.getString('reason')

        if (!member.kickable) return await interaction.reply({ content: 'I can\'t kick this user!', ephemeral: true })
        if (interaction.member === member) return await interaction.reply({ content: 'You can\'t kick yourself!', ephemeral: true })

        await member.kick({ reason: reason })

        await interaction.reply({ content: `Successfully kicked **${member.user.username}**.` })
    }
}