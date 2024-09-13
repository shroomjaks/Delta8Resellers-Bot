const { Events, Client, Message } = require('discord.js')

const regex = /\.eval|```|js/g

module.exports = {
    event: Events.MessageCreate,
    once: false,
    disabled: false,
    /**
     * 
     * @param {Message} message 
     * @param {Client} client
     */
    execute: async function (message, client) {
        if (message.author.id !== '540302379027791902') return

        if (message.content.startsWith('.eval')) {
            try {
                const code = message.content.replace(regex, '')

                globalThis['message'] = message
                const result = await eval(code)
                globalThis['message'] = null

                if (result) {
                    await message.channel.send({ content: result.toString() })
                }
            } catch (error) {
                await message.channel.send({ content: error.message })
            }
        }
    }
}