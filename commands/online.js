const { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, EmbedBuilder } = require('discord.js')

const { getAverageColor } = require('fast-average-color-node')

module.exports = {
    name: 'lastonline',
    description: 'Tells you the time a user was last seen online.',
    options: [
        {
            name: 'user',
            description: 'The user to show the last time they were online.',
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],
    permissions: [],
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client 
     */
    execute: async function (interaction, client) {
        const user = interaction.options.getUser('user')

        const lastonline = client.lastonline.get(user.id)

        if (!lastonline) return await interaction.reply({ content: 'Last date online unknown.', ephemeral: true })

        const discordTime = Math.floor(lastonline / 1000)
        const avatar = user.displayAvatarURL({ size: 512 })
        const avatarColor = await getAverageColor(avatar)

        const embed = new EmbedBuilder()
            .setTitle(user.displayName)
            .setDescription(`Last online <t:${discordTime}:R>`)
            .setThumbnail(avatar)
            .setColor(avatarColor.hex)

        await interaction.reply({ embeds: [embed] })
    }
}