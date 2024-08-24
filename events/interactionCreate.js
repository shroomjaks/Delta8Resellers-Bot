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
        if (interaction.isChatInputCommand()) {
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

                if (interaction.deferred) {
                    await interaction.editReply({ content: 'An error occurred while executing this command.', ephemeral: true })
                } else {
                    await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true })
                }
            }
        } else if (interaction.isButton()) {
            const uuid = interaction.customId

            let product = client.db.get('products').find(product => product.uuid === uuid)

            if (!product) return await interaction.reply({ content: 'Product not found.', ephemeral: true })

            product.restockReminders.push(interaction.user.id)

            client.db.set('products', [
                ...client.db.get('products'),
                product
            ])

            await interaction.reply({ content: 'You will be notified when this product is restocked.', ephemeral: true })
        }
    }
}