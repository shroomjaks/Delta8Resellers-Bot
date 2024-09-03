const { Events, Client, Message } = require('discord.js')

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
                let code = message.content.replace('.eval', '')
                code = code.replace('```js', '')
                code = code.replace('```', '').trim()

                await Object.getPrototypeOf(async function() {}).constructor(code)()

                await message.channel.send({ content: 'Ran code successfully!' })
            } catch (error) {
                await message.channel.send({ content: error.message })
            }
        }
    }
}