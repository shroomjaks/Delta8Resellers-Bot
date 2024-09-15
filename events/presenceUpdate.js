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
        if (newPresence.status === 'online' || newPresence.status === 'dnd' || newPresence.status === 'idle' || newPresence.status === 'invisible' && oldPresence.status === 'offline') {
            client.lastonline.set(newPresence.userId, Date.now())
        }
    }
}