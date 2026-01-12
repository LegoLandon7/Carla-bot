require('dotenv').config();

const API_KEY = process.env.SEARCH_ENGINE_KEY;
const CSE_ID = process.env.SEARCH_ENGINE_ID;

async function googleSearch(query, num = 1, description = true) {
    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${encodeURIComponent(query)}&num=${num}&safe=active`;
        const res = await fetch(url);
        const data = await res.json();

        const items = data.items;
        if (!items || items.length === 0) return "⚠️ No results found";

        return items.map(item => num === 1
            ? `- [${item.title}](${item.link})${description ? `\n-# ${item.snippet}`: ''}`
            : `- [${item.title}](${item.link})`
        ).join('\n\n');
    } catch (err) {
        return "⚠️ Something went wrong";
    }
}

module.exports = { googleSearch };