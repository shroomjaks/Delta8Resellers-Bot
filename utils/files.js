const { Client } = require('discord.js')

const rembg = require('@remove-background-ai/rembg.js')

const path = require('path')

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {URL} url 
     * @param {Boolean} removeBackground 
     */
    uploadFile: async function ({ url, removeBackground }) {
        const filesChannel = await client.channels.fetch('1288595231452827850')

        await filesChannel.send({ files: [url] })
    },
    /**
     * 
     * @param {Client} client 
     * @param {String} id 
     */
    getFile: async function (client, id) {

    }
}