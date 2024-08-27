const { Events, BaseClient, Client, MessageReaction, User } = require('discord.js')

module.exports = {
    event: Events.MessageReactionAdd,
    once: false,
    disabled: false,
    /**
     * 
     * @param {Client} client 
     */
    initialize: async function (client) {
        const verifyChannel = await client.channels.fetch('1276212096601686067')
        const verifyMessage = await verifyChannel.messages.fetch('1277129869565759510')

        verifyMessage.react('✅')
    },
    /**
     * 
     * @param {MessageReaction} reaction
     * @param {User} user 
     * @param {Client} client 
     */
    execute: async function (reaction, user, client) {
        if (reaction.message.id !== '1277129869565759510') return
        if (user.bot) return

        const member = await client.mainGuild.members.fetch(user.id)
        const memberRole = await client.mainGuild.roles.fetch('1276298509255184394')
    
        await member.roles.add(memberRole)
    }
}