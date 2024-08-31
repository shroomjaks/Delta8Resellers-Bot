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
        client.log.text(`**${interaction.user.username}** used **${interaction.commandName}**`)

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
                client.log.error(error)

                if (interaction.deferred) {
                    await interaction.editReply({ content: 'An error occurred while executing this command.', ephemeral: true })
                } else {
                    await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true })
                }
            }
        } else if (interaction.isButton()) {
            const uuid = interaction.customId

            let products = client.db.get('products')
            let product = products.find(product => product.uuid === uuid)

            if (!product) return await interaction.reply({ content: 'Product not found.', ephemeral: true })

            product.restockReminders.push(interaction.user.id)
            
            products = products.filter(product => product.uuid !== uuid)
            products.push(product)

            client.db.set('products', products)

            await interaction.reply({ content: 'You will be notified when this product is restocked.', ephemeral: true })
        }
    }
}