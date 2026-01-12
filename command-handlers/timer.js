const { ensureJson, readJson } = require("../utils/files.js");
const path = require('path');

ensureJson(path.resolve(__dirname, '../data/timers.json'));

let times = {};
let data = {};

async function handleTimers(client) {
    data = readJson(path.resolve(__dirname, '../data/timers.json'));

    for (const guildId in data) {
        for (const id in data[guildId]) {

            // get timer data
            const entry = data[guildId][id];
            if (!entry.enabled) continue;

            // set time data
            if (!times[guildId]) times[guildId] = {};
            if (!times[guildId][id]) {
                times[guildId][id] = {
                    time: entry.timeMs,
                    date: Date.now()
                };
            }

            const timeData = times[guildId][id];

            if (Date.now() >= timeData.date + timeData.time) {
                // repeat timer
                timeData.date = Date.now();

                const channel = await client.channels.fetch(entry.channelId);
                if (!channel?.isTextBased()) continue;

                try { await channel.send(entry.message); } catch(error) {}
            }
        }
    }
}

async function handleTimersMessages(client) {
    // messages
    client.on('messageCreate', (message) => {
        timeData(message);
    });
    
    // commands
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        timeData(null)
    });
}

// timer function
async function timeData(message) {
    for (const guildId in data) {
        for (const id in data[guildId]) {
            // get timer data
            const entry = data[guildId][id];
            if (!entry.enabled) continue;

            if (message?.channel.id === entry.channelId 
                && (message?.content?.trim().toLowerCase() === entry.messageReset?.trim().toLowerCase() 
                || entry.sentReset
            )) {
                // initialize time data
                if (!times[guildId]) times[guildId] = {};
                if (!times[guildId][id]) {
                    times[guildId][id] = {
                        time: entry.timeMs,
                        date: Date.now()
                    };

                // set time data
                } else times[guildId][id].date = Date.now();

                //console.log(`reset timer: ${id}`);
            }
        }
    }
}

module.exports = { handleTimers, handleTimersMessages };