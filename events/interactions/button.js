module.exports = {
    execute: async function (interaction) {
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
    }
}