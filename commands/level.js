const { Client, ChatInputCommandInteraction, ApplicationCommandOptionType } = require('discord.js')

const { createCanvas, loadImage } = require('@napi-rs/canvas')

module.exports = {
    name: 'level',
    description: 'Shows your current level and XP.',
    permissions: [],
    options: [
        {
            name: 'user',
            description: 'The user to show the level and XP of.',
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction
     */
    execute: async function (interaction, client) {
        await interaction.deferReply()

        const user = interaction.options.getUser('user') || interaction.user

        const profile = await client.xp.get(user.id)

        if (!profile) return await interaction.editReply({ content: 'This user has no XP profile.' })

        const canvas = createCanvas(2400, 1200)
        const context = canvas.getContext('2d')

        const background = await loadImage('/home/orangepi/Downloads/Summer.jpg')

        context.drawImage(background, 0, 0, canvas.width, canvas.height)

        const profilePicture = await loadImage(user.displayAvatarURL({ forceStatic: true, extension: 'png', size: 1024 }))

        context.drawImage(profilePicture, 100, 215, 768, 768)

        context.font = `bold 150px trebuchet ms`
        context.fillStyle = '#ffffff'

        context.fillText(user.username, 980, 415)

        context.font = 'bold 100px trebuchet ms'

        context.fillText(`Level: ${profile.level}`, 980, 650)
        context.fillText(`XP: ${profile.xp}`, 980, 885)

        await interaction.editReply({ files: [canvas.toBuffer('image/png')] })
    }
}