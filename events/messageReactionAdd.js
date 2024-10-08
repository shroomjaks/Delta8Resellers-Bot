const { Events, Client, MessageReaction, User, MessageReactionEventDetails } = require('discord.js')

module.exports = {
    event: Events.MessageReactionAdd,
    once: false,
    disabled: false,
    /**
     * 
     * @param {MessageReaction} reaction
     * @param {User} user 
     * @param {MessageReactionEventDetails} details
     * @param {Client} client 
     */
    execute: async function (reaction, user, details, client) {
        if (reaction.message.id !== '1277129869565759510') return

        const mainGuild = await client.guilds.fetch('1276202598692818996')

        const member = await mainGuild.members.fetch(user.id)
        const memberRole = await mainGuild.roles.fetch('1276298509255184394')
    
        await member.roles.add(memberRole)
    }
}