const { BaseClient, PermissionsBitField, ApplicationCommandOptionType, ChatInputCommandInteraction } = require('discord.js')

module.exports = {
    name: 'bans',
    description: 'Bans a member.',
    options: [
        {
            name: 'member',
            description: 'The member to ban.',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'reason',
            description: 'The reason.',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'deleteMessages',
            description: 'Whether or not to delete messages from this user less than 1 week old.',
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }
    ],
    permissions: [
        PermissionsBitField.Flags.BanMembers
    ],
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {BaseClient} client 
     */
    execute: async function (interaction, client) {
        const member = interaction.options.getMember('member')
        const reason = interaction.options.getString('reason')
        const deleteMessages = interaction.options.getBoolean('deleteMessages')

        let deleteMessageSeconds = 0

        if (deleteMessages) deleteMessageSeconds = 604800

        if (!member.bannable) return await interaction.reply({ content: 'I can\'t kick this user!', ephemeral: true })
            
        await member.ban({ reason: reason, deleteMessageSeconds: deleteMessageSeconds })

        await interaction.reply({ content: `Successfully banned **${member.user.username}**.` })
    }
}