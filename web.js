const fs = require('fs')

const images = fs.readdirSync('./images')

const server = Bun.serve({
    fetch(req, server) {
        const url = new URL(req.url)

        const fileName = url.pathname.split('/').pop()

        if (!images.includes(fileName)) {
            return server.send(404, 'Not found')
        }

        const file = fs.readFileSync(`./images/${fileName}`)

        return server.send(200, file, {
            'Content-Type': 'image/png'
        })
    }
})

console.log(`Listening on ${server.port}`)