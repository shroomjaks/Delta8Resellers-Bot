const { Client } = require('discord.js')

module.exports = {
    event: 'msgscan',
    once: false,
    disabled: true,
    /**
     * 
     * @param {Client} client 
     */
    execute: async function (client) {
        console.log('scanny scan scan')
    }
}