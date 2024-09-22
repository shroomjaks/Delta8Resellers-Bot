const { Events, BaseInteraction, ButtonBuilder } = require('discord.js')

module.exports = {
    event: Events.InteractionCreate,
    once: false,
    disabled: false,
    /**
     * 
     * @param {BaseInteraction} interaction 
     */
    execute: async function (interaction) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.find(command => command.name === interaction.commandName)

            if (!command) return console.log(`Command not found for ${interaction.commandName}`)

            try {
                if (interaction.memberPermissions.has(command.permissions)) {
                    await command.execute(interaction)
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
            const id = interaction.customId

            if (id.startsWith('product:')) {
                const uuid = id.split(':')[1]

                let products = client.stock.get('products')
                let product = products.find(product => product.uuid === uuid)

                if (!product) return await interaction.reply({ content: 'Product not found.', ephemeral: true })
                if (product.restockReminders.includes(interaction.user.id)) return await interaction.reply({ content: 'You are already subscribed to a restock reminder for this product.', ephemeral: true })

                product.restockReminders.push(interaction.user.id)

                client.stock.set('products', products)

                await interaction.reply({ content: 'You will be notified when this product is restocked.', ephemeral: true })
            } else if (id.startsWith('strain:')) {
                const strainValue = id.split(':')[1]

                let products = client.stock.get('products')
                let strain = products.flatMap(product => product.strainStock).find(strain => strain.strainValue === strainValue)

                if (!strain) return await interaction.reply({ content: 'Strain not found.', ephemeral: true })
                if (strain.restockReminders.includes(interaction.user.id)) return await interaction.reply({ content: 'You are already subscribed to a restock reminder for this strain.', ephemeral: true })

                strain.restockReminders.push(interaction.user.id)

                client.stock.set('products', products)

                await interaction.reply({ content: 'You will be notified when this strain is restocked.', ephemeral: true })
            }
        } else if (interaction.isAutocomplete()) {
            const command = client.commands.find(command => command.name === interaction.commandName)

            if (!command) return console.log(`Command not found for ${interaction.commandName}`)

            try {
                await command.autocomplete(interaction)
            } catch (error) {
                console.error(error)
            }
        }
    }
}