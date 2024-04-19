import * as dotenv from 'dotenv';
import { Collection } from 'discord.js';

dotenv.config();
const url = process.env.ARROW_HEAD_API;

const getJSON = async url => {
    const response = await fetch(url);
    return response.json(); // get JSON from the response 
}

const getNewsFeed = () => {
    return getJSON(url + '/api/NewsFeed/801?maxEntries=1024')
        .then(data => {
            const newsFeed = new Collection();
            for (var key in data) {
                newsFeed.set(data[key]['id'], data[key]);
            }
            return newsFeed
        });
};

export { getNewsFeed }