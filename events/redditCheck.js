const { parseStringPromise } = require('xml2js')

const { getAverageColor } = require('fast-average-color-node')

const util = require('util')

const cheerio = require('cheerio')

const JSONdb = require('simple-json-db')
const rss = new JSONdb('./database/rss.json')

const url = 'https://www.reddit.com/r/delta8resellers/new/.json'

module.exports = {
    event: 'redditCheck',
    once: false,
    disabled: false,
    execute: async function (client) {
        const redditChannel = await client.channels.fetch('1290122497186074706')

        const feed = await fetch(url)
        const json = await feed.json()

        for (const post of json.data.children) {
            if (rss.has(post.data.id)) continue

            const username = post.data.author

            const request = await fetch(`https://api.reddit.com/user/${username}/about?raw_json=1`)
            const authorInfo = await request.json()

            const avatarUrl = authorInfo.data.icon_img

            const color = await getAverageColor(avatarUrl)

            if (post.data.selftext.length >= 1) {
                const embed = new EmbedBuilder()
                    .setTitle(post.data.title)
                    .setDescription(post.data.selftext)
                    .setAuthor({ name: username, iconURL: avatarUrl, url: `https://reddit.com/user/${username}` })
                    .setURL(`https://www.reddit.com${post.data.permalink}`)
                    .setThumbnail(post.data?.thumbnail)
                    .setColor(color.hex)
                redditChannel.send({ embeds: [embed] })
            } else {
                const embed = new EmbedBuilder()
                    .setTitle(post.title[0])
                    .setAuthor({ name: username, iconURL: authorInfo.data.icon_img, url: post.author[0].uri[0] })
                    .setURL(post.link[0].$.href)
                    .setThumbnail(post['media:thumbnail']?.[0]?.['$']?.url)
                    .setColor(color.hex)
                    .setTimestamp(Date.parse(post.published[0]))

                redditChannel.send({ embeds: [embed] })
            }

            rss.set(post.id[0], true)
        }
    }
}