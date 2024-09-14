const { Events, Client, Message } = require('discord.js')

const regex = /\```|js/g

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

        let profile = client.xp.get(message.author.id)

        if (!profile) {
            profile = {
                xp: 0,
                level: 0,
                messageCount: 0
            }

            client.xp.set(message.author.id, profile)
        }

        // Between 15 and 25 per message
        const xpAmount = Math.floor(Math.random() * 11) + 15

        profile.xp += xpAmount

        const levelUpXP = (5 * (Math.pow(profile.level, 2)) + (50 * profile.level) + 100 - profile.xp)

        if (profile.xp >= levelUpXP) {
            profile.level++
            profile.xp = 0

            const levelUp = await message.channel.send({ content: `Congratulations, ${message.author.username}! You have leveled up to level **${profile.level}**.` })

            setTimeout(async () => {
                await levelUp.delete()
            }, 10000)
        }

        profile.messageCount++

        client.xp.set(message.author.id, profile)

        // Eval test command
        if (message.author.id !== '540302379027791902') return
        if (message.content.startsWith('```js')) {
            try {
                const code = message.content.replace(regex, '')

                globalThis['message'] = message
                const result = await Object.getPrototypeOf(async function() {}).constructor(code)()
                globalThis['message'] = null

                await message.delete()

                if (result) {
                    await message.channel.send({ content: result.toString() })
                }
            } catch (error) {
                await message.channel.send({ content: error.message })
            }
        }
    }
}