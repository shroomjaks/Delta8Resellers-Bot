const { Client } = require('discord.js')

module.exports = {
    name: 'refresh',
    once: false,
    disabled: true,
    /**
     * 
     * @param {Client} client 
     */
    execute: async function (client) {
        const commandsFolder = fs.readdirSync(path.join(__dirname, '..', 'commands'))
        const eventsFolder = fs.readdirSync(path.join(__dirname, '..', 'events'))

        const newCommands = []

        for (const commandFile of commandsFolder) {
            const command = require(path.join(__dirname, '..', 'commands', commandFile))
        
            newCommands.push(command)
        }

        client.commands = newCommands

        for (const activeEvent of client.events) {
            client.removeListener(activeEvent.event, activeEvent.execute)
        }

        for (const eventFile of eventsFolder) {
            const event = require(path.join(__dirname, '..', 'events', eventFile))
        
            if (event?.disabled) continue
        
            try {
                if (event.once) {
                    client.once(event.event, (...args) => event.execute(...args, client))
                } else {
                    client.on(event.event, (...args) => event.execute(...args, client))
                }
            } catch (error) {
                client.log.error(error)
            }
        }
    }
}