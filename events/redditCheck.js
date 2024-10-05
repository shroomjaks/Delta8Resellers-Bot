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
        const feedJson = await feed.json()

        if (!feedJson || !feedJson.data) return console.error('Failed to fetch Reddit feed.')

        // Delete any IDs that arent in the feed
        let alreadyPosted = rss.get('alreadyPosted')

        for (const id of alreadyPosted) {
            if (!feedJson.data.children.find(post => post.data.id === id)) {
                alreadyPosted.splice(alreadyPosted.indexOf(id), 1)
            }
        }

        for (const post of feedJson.data.children) {
            if (alreadyPosted.includes(post.data.id)) continue

            console.log(`Posting Reddit post ${post.data.id}`)

            const username = post.data.author

            const author = await fetch(`https://api.reddit.com/user/${username}/about?raw_json=1`)
            const authorJson = await author.json()

            const avatarUrl = authorJson.data.icon_img

            const color = await getAverageColor(avatarUrl).catch(() => null)

            const embed = new EmbedBuilder()
                .setTitle(post.data.title)
                .setAuthor({ name: username, iconURL: avatarUrl, url: `https://reddit.com/user/${username}` })
                .setURL(`https://www.reddit.com${post.data.permalink}`)
                .setColor(color?.hex || '#FF4500')

            if (post.data.selftext.length >= 1) embed.setDescription(post.data.selftext)
            console.log(post.data?.thumbnail)
            if (post.data?.thumbnail && post.data?.thumbnail !== 'nsfw' && post.data?.thumbnail !== 'self' && post.data?.thumbnail !== 'default') embed.setThumbnail(post.data.thumbnail)

            await redditChannel.send({ embeds: [embed] })

            alreadyPosted.push(post.data.id)

            rss.set('alreadyPosted', alreadyPosted)
        }
    }
}