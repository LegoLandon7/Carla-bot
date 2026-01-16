// imports
require('dotenv').config();

// keys
const API_KEY = process.env.GOOGLE_PROJECT_KEY;
const CSE_ID = process.env.SEARCH_ENGINE_ID;

// main google search
async function googleSearch(query, num = 1, description = true) {
    try {
        // search url
        const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${encodeURIComponent(query)}&num=${num}&safe=active`;
        const res = await fetch(url);
        const data = await res.json();

        // get items
        const items = data.items;
        if (!items || items.length === 0) return "⚠️ No results found";

        // return
        return items.map(item => num === 1
            ? `- [${item.title}](${item.link})${description ? `\n-# ${item.snippet}`: ''}`
            : `- [${item.title}](${item.link})`
        ).join('\n\n');
    } catch (err) {
        return "⚠️ Something went wrong";
    }
}

// exports
module.exports = { googleSearch };