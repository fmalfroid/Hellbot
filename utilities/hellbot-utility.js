import * as helldiversAPI from '../helldiver-2-API/api.js';
import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { JsonDB, Config } from 'node-json-db';
import Jimp from "jimp";
import * as fs from 'fs';
import * as path from 'path'

// Images
const logo = 'https://cdn.discordapp.com/attachments/1229883616704856086/1231525298344820806/super-earth.png?ex=6637464f&is=6624d14f&hm=351da5285adeb4877c72b284d3c57a48464c4e371f88116861d16f127a1da979&';
const democracy = 'https://cdn.discordapp.com/attachments/1229883616704856086/1231226366981312602/democracy.gif?ex=66362fe8&is=6623bae8&hm=ed637d7e9e79e49fe58e68618e5ecbcd979dc56a02c968709118a5a11e3e27e0&';
const medals = 'https://cdn.discordapp.com/attachments/1229883616704856086/1231526300401795092/medals.png?ex=6637473e&is=6624d23e&hm=ed187fead9038aec93d4ddac178c3e1d8c120bd34d7cd9ee11f8b0664773511e&';
const medals_fileName = "./resources/medals.png";

// Colors
const yellow = 0xFFE80A;
const red = 0xFF0000;
const green = 0x4CFF00;
const blue = 0x0094FF;

// Database
var db = new JsonDB(new Config("data", true, true, '/'));

/**
 * Create Embed for news in news feed
 * 
 * @param {*} news 
 * @param {*} color 
 * @param {*} image 
 * @returns 
 */
function createEmbedForNews(news, color, image) {
	return new EmbedBuilder()
		.setColor(color) // Blue
		.setDescription(news)
        .setThumbnail(logo)
        .setImage(image)
		.setTimestamp()
}

/**
 * Create Embed for Major order
 * 
 * @param {*} assignement 
 * @param {*} image 
 * @returns 
 */
function createEmbedForAssignement(assignement, image) {
	return new EmbedBuilder()
		.setColor(blue) // Blue
        .setTitle(assignement.title)
		.setDescription(assignement.brief)
        .setThumbnail(logo)
        .addFields(
            {name: 'Objective', value: assignement.description.length >= 1 ? assignement.description : " "}
        )
        .setImage(image)
		.setTimestamp()
}

/**
 * Get the correct arguments to create the Embed for a News
 * 
 * @param {*} news 
 * @returns 
 */
function NewsFeedEmbedFactory(news) {
    if (news.includes("NEW MAJOR ORDER")) {
        return createEmbedForNews(news, yellow, null);
    } else if (news.includes("MAJOR ORDER WON")) {
        return createEmbedForNews(news, green, democracy);
    } else if (news.includes("MAJOR ORDER LOST")) {
        return createEmbedForNews(news, red, null);
    } else {
        return createEmbedForNews(news, blue, null);
    }

}

/**
 * Create an image with the number of medals rewarded for a major order
 * 
 * @param {*} assignement 
 * @param {*} filename 
 * @returns 
 */
async function createMedalsImageIfNotExist(assignement, filename) {
    if (fs.existsSync(filename)) {
        return 0;
    }

    var loadedImage;
    await Jimp.read(medals_fileName)
        .then(function (image) {
            loadedImage = image;
            return Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
        })
        .then(function (font) {
            loadedImage.print(font, 970, 95, `${assignement.reward}`)
                .write(filename)
        })
        .catch(function (err) {
            console.error(err);
            return 1;
        });
    await checkExistsWithTimeout(filename, 10)
    return 0;
}

/**
 * Get the current Major order
 * 
 * @returns 
 */
export async function getAssignement() {
    const assignement = await helldiversAPI.getAssignement();
    const filename = `./resources/medals_${assignement.reward}.png`
    const image_result = await createMedalsImageIfNotExist(assignement, filename)

    var files_to_attach = []
    var medals_to_attach;

    if (image_result === 0) {
        const medals_attachement = new AttachmentBuilder(filename);
        medals_to_attach = 'attachment://' + `medals_${assignement.reward}.png`;
        files_to_attach = [medals_attachement];
    } else {
        medals_to_attach = null;
    }
    

    return { embeds: [createEmbedForAssignement(assignement, medals_to_attach)], files: files_to_attach }
}

/**
 * Send the news feed to all discord servers using the bot
 * 
 * @param {*} client 
 */
export async function sendNewsFeed(client) {
    var last_news_sent = await db.getData("/last_news_id");
	helldiversAPI.getNewsFeed().then(newsFeed => {
		[...newsFeed.keys()].filter(key => key > last_news_sent).forEach(key => {
			var news = newsFeed.get(key)["message"];
            if (!(news === undefined)) {
                news = news.replace("</i=3>", "<i=3>");
                news = news.replace("</i=1>", "<i=1>");
                while (news.includes("<i=3>") || news.includes("<i=1>")) {
                    var indexOf3 = news.indexOf("<i=3>");
                    var indexOf1 = news.indexOf("<i=1>");
                    if ((indexOf3 < indexOf1 && indexOf3 > -1) || indexOf1 < 0) {
                        news = news.replace("<i=3>", "# ").replace("</i>", "");
                    } else if (indexOf1 > -1) {
                        news = news.replace("<i=1>", "**").replace("</i>", "**");
                    }
                }

                client.guilds.cache.forEach(async guild => {
                    const id = guild.id;
                    if (db.exists('/servers_channels.' + id)) {
                        const channel_id = await db.getData('/servers_channels/' + id);
                        const channelToSend = client.channels.cache.find(channel => channel.id === channel_id);
                        if (!(channelToSend === undefined)) {
                            channelToSend.send({ embeds: [NewsFeedEmbedFactory(news)] })
                        }
                    }
                })
                last_news_sent = key;
                db.push("/last_news_id", last_news_sent);
            }
		})
	});
}

/**
 * Wait for a file to be created
 * 
 * @param {*} filePath 
 * @param {*} timeout 
 * @returns 
 */
function checkExistsWithTimeout(filePath, timeout) {
    return new Promise(function (resolve, reject) {

        var timer = setTimeout(function () {
            watcher.close();
            reject(new Error('File did not exists and was not created during the timeout.'));
        }, timeout);

        fs.access(filePath, fs.constants.R_OK, function (err) {
            if (!err) {
                clearTimeout(timer);
                watcher.close();
                resolve();
            }
        });

        var dir = path.dirname(filePath);
        var basename = path.basename(filePath);
        var watcher = fs.watch(dir, function (eventType, filename) {
            if (eventType === 'rename' && filename === basename) {
                clearTimeout(timer);
                watcher.close();
                resolve();
            }
        });
    });
}