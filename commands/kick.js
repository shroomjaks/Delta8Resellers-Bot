const { BaseInteraction, BaseClient, PermissionsBitField, ApplicationCommandOptionType, CommandInteraction, ChatInputCommandInteraction } = require('discord.js')

module.exports = {
    name: 'kicks',
    description: 'Kicks a member.',
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
    permissions: [
        PermissionsBitField.Flags.KickMembers
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
            
        await member.kick({ reason: reason })

        await interaction.reply({ content: `Successfully kicked **${member.user.username}**.` })
    }
}