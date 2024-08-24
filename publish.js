require('dotenv').config()

const { REST, Routes } = require('discord.js')

const fs = require('fs')
const path = require('path')

const commandsFolder = fs.readdirSync('./commands')
const commands = []

for (const commandFile of commandsFolder) {
    const command = require(path.join(__dirname, 'commands', commandFile))

    console.log(command.name)

    commands.push({
        name: command.name,
        description: command.description,
        options: command?.options
    })
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })

    console.log('Successfully reloaded application (/) commands.')
} catch (error) {
    console.error(error)
}