const { parseStringPromise } = require('xml2js')

const { getAverageColor } = require('fast-average-color-node')

const util = require('util')

const cheerio = require('cheerio')

const JSONdb = require('simple-json-db')
const rss = new JSONdb('./database/rss.json')

const url = 'https://www.reddit.com/r/delta8resellers/new/.rss'

module.exports = {
    event: 'redditCheck',
    once: false,
    disabled: false,
    execute: async function (client) {
        const redditChannel = await client.channels.fetch('1290122497186074706')

        const feed = await fetch(url)
        const xml = await feed.text()

        const json = await parseStringPromise(xml)

        for (const post of json.feed.entry) {
            if (rss.has(post.id[0])) continue

            const username = post.author[0].name[0].replace('/u/', '')

            const request = await fetch(`https://api.reddit.com/user/${username}/about`)
            const authorInfo = await request.json()

            const avatarUrl = authorInfo.data.icon_img.split('?')[0]

            const color = await getAverageColor(avatarUrl)

            const html = cheerio.load(post?.content[0]?._)
            const postBody = html('p').text()

            if (postBody.length >= 1) {
                const embed = new EmbedBuilder()
                    .setTitle(post.title[0])
                    .setDescription(postBody)
                    .setAuthor({ name: username, iconURL: authorInfo.data.icon_img, url: post.author[0].uri[0] })
                    .setURL(post.link[0].$.href)
                    .setThumbnail(post['media:thumbnail']?.[0]?.['$']?.url)
                    .setColor(color.hex)
                    .setTimestamp(Date.parse(post.published[0]))

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