const { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, EmbedBuilder } = require('discord.js')

const { getAverageColor } = require('fast-average-color-node')

module.exports = {
    name: 'online',
    description: 'Tells you the time a user was last seen online and for how long.',
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

        const lastonline = client.online.get(user.id) || null
        const lastoffline = client.offline.get(user.id) || null

        if (!lastonline || !lastoffline) {
            return await interaction.reply({ content: 'I have no data on this user.', ephemeral: true })
        }

        const online = Math.floor(lastonline / 1000)
        const offline = Math.floor(lastoffline / 1000)

        const avatar = user.displayAvatarURL({ dynamic: true, size: 512 })
        const avatarColor = await getAverageColor(avatar)

        const embed = new EmbedBuilder()
            .setTitle(user.displayName)
            .setDescription(`Last seen online: <t:${online}:R>\nLast seen offline: <t:${offline}:R>`)
            .setThumbnail(avatar)
            .setColor(avatarColor.hex)

        await interaction.reply({ embeds: [embed] })
    }
}