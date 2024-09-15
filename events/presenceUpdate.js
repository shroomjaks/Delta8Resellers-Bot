const { Events, Presence, Client } = require('discord.js')

const path = require('path')

const JSONdb = require('simple-json-db')

const online = new JSONdb(path.join('..', 'database', 'online.json'))
const offline = new JSONdb(path.join('..', 'database', 'offline.json'))

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
        if (!oldPresence || !newPresence) return
        if (oldPresence.status === newPresence.status) return
        if (newPresence.user.bot) return

        if (oldPresence.status === 'offline') {
            online.set(newPresence.userId, Date.now())
        }

        if (newPresence.status === 'offline') {
            offline.set(newPresence.userId, Date.now())
        }
    }
}