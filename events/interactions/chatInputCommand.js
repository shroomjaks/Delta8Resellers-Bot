module.exports = {
    execute: async function (interaction) {
        const command = client.commands.find(command => command.name === interaction.commandName)

        if (!command) return console.log(`Command not found for ${interaction.commandName}`)

        try {
            if (interaction.memberPermissions.has(command.permissions)) {
                await command.execute(interaction, client)
            } else {
                await interaction.reply({ content: 'You do not have the required permissions to execute this command.', ephemeral: true })
            }
        } catch (error) {
            client.log.error(error)

            if (interaction.deferred) {
                await interaction.editReply({ content: 'An error occurred while executing this command.', ephemeral: true })
            } else {
                await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true })
            }
        }
    }
}