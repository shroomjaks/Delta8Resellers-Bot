const { Events, EmbedBuilder, GuildMember, Client } = require('discord.js')

module.exports = {
    event: Events.GuildMemberRemove,
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
            .setTitle(`Goodbye, ${member.user.username}...`)
            .setDescription(`${member.user.username} has left.\nFrom all of us, we wish you the best!`)
            .setThumbnail(member.displayAvatarURL({ size: 512 }))
            .setColor('#ffc801')

        await welcomeLeave.send({ embeds: [embed] })
    }
}