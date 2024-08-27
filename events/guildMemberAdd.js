const { Events, EmbedBuilder, GuildMember, Client } = require('discord.js')

module.exports = {
    event: Events.GuildMemberAdd,
    once: false,
    disabled: false,
    /**
     * 
     * @param {GuildMember} member 
     * @param {Client} client
     */
    execute: async function (member, client) {
        const welcomeLeave = await client.channels.fetch('1277409930546122822')

        const embed = new EmbedBuilder()
            .setTitle(`Welcome, ${member.user.username}!`)
            .setDescription(`Welcome to The Official Delta8Resellers Community, ${member.user.username}. Enjoy your stay!`)
            .setThumbnail(member.displayAvatarURL({ size: 512 }))
            .setColor('#4bff00')

        await welcomeLeave.send({ embeds: [embed] })
    }
}