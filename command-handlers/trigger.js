const { ensureJson, readJson } = require("../utils/files.js");
const path = require('path');

ensureJson(path.resolve(__dirname, '../data/triggers.json'));

let data = {};
let cooldowns = {};

async function handleTriggers(client) {
    client.on('messageCreate', async (message) => {
        // read data
        data = readJson(path.resolve(__dirname, '../data/triggers.json'));

        if (!message.guild || message.author.bot) return;
        const guildId = message.guild.id;
        if (!data[guildId]) return;

        for (const id in data[guildId]) {
            // get trigger data
            const entry = data[guildId][id];
            if (!entry.enabled) continue;
            if (!data[guildId]) continue;

            const trigger = entry.trigger;
            
            // check if trigger should send
            let send = false;
            const strictCase = entry.matchType === 'strict' ? '' : 'i';
            if (entry.matchType === 'strict' && trigger === message.content) {
                send = true
            } else if (entry.matchType === 'wholeWord') {
                const escaped = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                const regex = new RegExp(`\\b${escaped}\\b`, strictCase);

                if (regex.test(message.content)) send = true;
            } else if (entry.matchType === 'regex') {
                try {
                    const regex = new RegExp(trigger, strictCase);
                    if (regex.test(message.content)) send = true;
                } catch(err) {console.error(err)}
            } else if (message.content.toLowerCase().includes(trigger.toLowerCase()) && entry.matchType === 'none') send = true;

            //console.log(trigger + " " + message.content + " " + send + " " + entry.matchType);

            // cooldown initialize
            if (!cooldowns[guildId]) cooldowns[guildId] = 0;

            // send
            if (send && Date.now() - cooldowns[guildId] >= 5000) try { // 5 seconds
                await message.channel.send(entry.message); 
                cooldowns[guildId] = Date.now();
            } catch(error) {}
        }
    });
}

module.exports = { handleTriggers };