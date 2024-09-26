const { Client, MessageAttachment } = require('discord.js')

const rembg = require('@remove-background-ai/rembg.js')

const path = require('path')

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {URL} url 
     * @param {Boolean} removeBackground 
     */
    uploadFile: async function (url, removeBackground) {
        const filesChannel = await client.channels.fetch('1288595231452827850')

        if (removeBackground) {
            const response = await fetch(url)
            const buffer = await response.buffer()

            const noBackground = await rembg({
                apiKey: process.env.REMOVE_BG_KEY,
                inputImage: { imageBuffer: buffer },
                returnBase64: true
            })

            const attachment = new MessageAttachment(noBackground, 'image.png')

            await filesChannel.send({ files: [attachment] })
        } else {
            const attachment = new MessageAttachment(url)

            await filesChannel.send({ files: [attachment] })
        }
    },
    /**
     * 
     * @param {Client} client 
     * @param {String} id 
     */
    getFile: async function (client, id) {

    }
}