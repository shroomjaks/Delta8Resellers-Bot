const { Events, Client, Message } = require('discord.js')

function evalInContext(js, context) {
    return function () { return eval(js) }.call(context)
}

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
        if (message.author.bot) return
        if (message.author.id !== '540302379027791902') return

        if (message.content.startsWith('.eval')) {
            try {
                // get code wrapped in ```
                const code = message.content.match(/```(?:js)?\n?([^]+)```/)[1]

                // run code
                const result = evalInContext(code, { message, client })
            } catch (error) {
                await message.channel.send({ content: error.message })
            }
        }
    }
}