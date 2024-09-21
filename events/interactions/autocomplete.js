module.exports = {
    execute: async function (interaction) {
        const command = client.commands.get(interaction.commandName)

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`)
            return
        }

        try {
            await command.autocomplete(interaction)
        } catch (error) {
            console.error(error)
        }
    }
}