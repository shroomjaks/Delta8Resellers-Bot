const { Events, EmbedBuilder, GuildBan } = require('discord.js')

module.exports = {
    event: Events.GuildBanAdd,
    once: false,
    disabled: false,
    /**
     * 
     * @param {GuildBan} ban 
     * @param {Client} client
     */
    execute: async function (ban, client) {
        const welcomeLeave = await client.channels.fetch('1277409930546122822')

        const embed = new EmbedBuilder()
            .setTitle(`Ooof, ${ban.user.username} got banned.`)
            .setDescription(`Yikes! Seems as though ${ban.user.username} has been banned from the community.\nBye bye!`)
            .setThumbnail(ban.user.displayAvatarURL({ size: 512 }))
            .setColor('#fe0000')

        await welcomeLeave.send({ embeds: [embed] })
    }
}