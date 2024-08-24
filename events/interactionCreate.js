const { Events, BaseInteraction, BaseClient, EmbedBuilder } = require('discord.js')

module.exports = {
    event: Events.InteractionCreate,
    once: false,
    disabled: false,
    /**
     * 
     * @param {BaseInteraction} interaction 
     * @param {BaseClient} client 
     */
    execute: async function (interaction, client) {
        const command = client.commands.find(command => command.name === interaction.commandName)

        if (!command) return console.log(`Command not found for ${interaction.commandName}`)

        try {
            if (interaction.memberPermissions.has(command.permissions)) {
                await command.execute(interaction, client)
            } else {
                await interaction.reply({ content: 'You do not have the required permissions to execute this command.', ephemeral: true })
            }
        } catch (error) {
            console.error(error)

            const embed = new EmbedBuilder()
                .setTitle(`Command ${interaction.commandName} Error`)
                .setDescription(error.toString())
                .setTimestamp(Date.now())
                .setColor('#FF0000')

            await client.logHook.send({ embeds: [embed] })

            await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true })
        }
    }
}