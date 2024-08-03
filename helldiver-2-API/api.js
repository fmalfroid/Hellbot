import * as dotenv from 'dotenv';
import { Collection } from 'discord.js';

dotenv.config();
const arrowHeadApiUrl = process.env.ARROW_HEAD_API;

/**
 * Fetch JSON data from url
 * 
 * @param String url 
 * @returns JSON
 */
const getJSON = async url => {
    const response = await fetch(url);
    return response.json();
}

/**
 * Get the id of the current war from the ArrowHead API
 * 
 * @returns int WarID
 */
async function getWarId() {
    return getJSON(arrowHeadApiUrl + '/api/WarSeason/current/WarID')
        .then(data => {
            const WarID = data['id'];
            return WarID;
        }).catch((error) => {
            return 801;
        });
}

/**
 * Get The news feed of the current war from the ArrowHead API
 * 
 * @returns Map<int, News> NewsFeed
 */
export async function getNewsFeed() {
    const warId = await getWarId()
    return getJSON(arrowHeadApiUrl + `/api/NewsFeed/${warId}?maxEntries=1024`)
        .then(data => {
            const newsFeed = new Collection();
            for (var key in data) {
                newsFeed.set(data[key]['id'], data[key]);
            }
            return newsFeed
        }).catch((error) => {
            return new Collection();
        });
};

/**
 * Get The current Major Order from the ArrowHead API
 * 
 * @returns 
 */
export async function getAssignement() {
    const warId = await getWarId()
    return getJSON(arrowHeadApiUrl + '/api/v2/Assignment/War/' + warId)
        .then(data => {
            const assignement = {
                title: data[0]['setting']['overrideTitle'],
                brief: data[0]['setting']['overrideBrief'],
                description: data[0]['setting']['taskDescription'],
                reward: data[0]['setting']['reward']['amount']
            }
            return assignement;
        }).catch((error) => {
            const assignement = {
                title: "",
                brief: "",
                description: "",
                reward: 0
            }
            return new Collection();
        });
};