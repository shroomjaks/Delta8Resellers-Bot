const { Events, Presence, Client, User } = require('discord.js')

module.exports = {
    event: Events.PresenceUpdate,
    once: false,
    disabled: false,
    /**
     * 
     * @param {Presence} oldPresence 
     * @param {Presence} newPresence 
     * @param {Client} client 
     */
    execute: async function (oldPresence, newPresence, client) {
        if (!oldPresence.status || !newPresence.status) return
        if (oldPresence.status === newPresence.status) return
        if (newPresence.user.bot) return

        if (oldPresence.status === 'offline') {
            client.lastonline.set(newPresence.userId, Date.now())
        }
    }
}