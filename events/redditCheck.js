const { parseStringPromise } = require('xml2js')

const { getAverageColor } = require('fast-average-color-node')

const JSONdb = require('simple-json-db')
const rss = new JSONdb('./database/rss.json')

module.exports = {
    event: 'redditCheck',
    once: false,
    disabled: false,
    execute: async function (client) {
        const redditChannel = await client.channels.fetch('1290122497186074706')

        const feed = await fetch('https://www.reddit.com/r/delta8resellers/new/.json')
        const json = await feed.json()

        for (const post of json.data.children) {
            if (rss.has(post.data.id)) continue

            const username = post.data.author

            const request = await fetch(`https://api.reddit.com/user/${username}/about?raw_json=1`)
            const authorInfo = await request.json()

            const avatarUrl = authorInfo.data.icon_img

            const color = await getAverageColor(avatarUrl)

            const embed = new EmbedBuilder()
                .setTitle(post.data.title)
                .setAuthor({ name: username, iconURL: avatarUrl, url: `https://reddit.com/user/${username}` })
                .setURL(`https://www.reddit.com${post.data.permalink}`)
                .setColor(color.hex)

            if (post.data.selftext.length >= 1) embed.setDescription(post.data.selftext)
            if (post.data?.thumbnail) embed.setThumbnail(post.data.thumbnail)

            redditChannel.send({ embeds: [embed] })

            rss.set(post.data.id, true)
        }
    }
}