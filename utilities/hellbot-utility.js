import * as helldiversAPI from '../helldiver-2-API/api.js';
import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { Store } from 'data-store';

const logo_fileName = 'super-earth.png';
const democracy_fileName = 'democracy.gif';
const logo_attachement = 'attachment://' + logo_fileName;
const democracy_attachement = 'attachment://' + democracy_fileName;
const logo = new AttachmentBuilder('./resources/' + logo_fileName);
const democracy = new AttachmentBuilder('./resources/' + democracy_fileName);

const store = new Store({
	path: process.cwd() + '/data.json'
});

var last_news_sent = store.get("last_news_id");

function createEmbedForNewMajorOrder(news) {
	return new EmbedBuilder()
		.setColor(0xF7FF26) // Yellow
		.setDescription(news)
        .setThumbnail(logo_attachement)
		.setTimestamp()
}

function createEmbedForMajorOrderLost(news) {
	return new EmbedBuilder()
		.setColor(0xFF0000) // Red
		.setDescription(news)
        .setThumbnail(logo_attachement)
		.setTimestamp()
}

function createEmbedForMajorOrderWon(news) {
	return new EmbedBuilder()
		.setColor(0x4CFF00) // Green
		.setDescription(news)
        .setThumbnail(logo_attachement)
        .setImage(democracy_attachement)
		.setTimestamp()
}

function createEmbedForNews(news) {
	return new EmbedBuilder()
		.setColor(0x0094FF) // Blue
		.setDescription(news)
        .setThumbnail(logo_attachement)
		.setTimestamp()
}

function NewsFeedEmbedFactory(news) {
    if (news.includes("NEW MAJOR ORDER")) {
        return createEmbedForNewMajorOrder(news);
    } else if (news.includes("MAJOR ORDER WON")) {
        return createEmbedForMajorOrderWon(news);
    } else if (news.includes("MAJOR ORDER LOST")) {
        return createEmbedForMajorOrderLost(news);
    } else {
        return createEmbedForNews(news);
    }

}

function getFiles(news) {
    if (news.includes("NEW MAJOR ORDER")) {
        return [logo];
    } else if (news.includes("MAJOR ORDER WON")) {
        return [democracy, logo];
    } else if (news.includes("MAJOR ORDER LOST")) {
        return [logo];
    } else {
        return [logo];
    }

}

function sendNewsFeed(client) {
	helldiversAPI.getNewsFeed().then(newsFeed => {
		[...newsFeed.keys()].filter(key => key > last_news_sent).forEach(key => {
			var news = newsFeed.get(key)["message"]
            if (!(news === undefined)) {
                while (news.includes("<i=3>") || news.includes("<i=1>")) {
                    var indexOf3 = news.indexOf("<i=3>");
                    var indexOf1 = news.indexOf("<i=1>");
                    if ((indexOf3 < indexOf1 && indexOf3 > -1) || indexOf1 < 0) {
                        news = news.replace("<i=3>", "# ").replace("</i>", "");
                    } else if (indexOf1 > -1) {
                        news = news.replace("<i=1>", "**").replace("</i>", "**");
                    }
                }

                client.guilds.cache.forEach(guild => {
                    const id = guild.id;
                    if (store.has('servers_channels.' + id)) {
                        const channel_id = store.get('servers_channels.' + id);
                        const channelToSend = client.channels.cache.find(channel => channel.id === channel_id);
                        if (!(channelToSend === undefined)) {
                            channelToSend.send({ embeds: [NewsFeedEmbedFactory(news)], files: getFiles(news) })
                        }
                    }
                })
                last_news_sent = key;
                store.set("last_news_id", last_news_sent);
                store.save();
            }
		})
	});
}

export { sendNewsFeed }