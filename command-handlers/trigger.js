// imports
const { mentionUser } = require("../utils/user.js");
const { ensureJson, readJson } = require("../utils/files.js");
const path = require('path');

// data
ensureJson(path.resolve(__dirname, '../data/triggers.json'));

let data = {};
let cooldowns = {};

async function handleTriggers(client) {
    client.on('messageCreate', async (message) => {
        // read data
        data = readJson(path.resolve(__dirname, '../data/triggers.json'));

        // checks
        if (!message.guild || message.author.bot) return;
        const guildId = message.guild.id;
        if (!data[guildId]) return;

        // cooldown
        if (!cooldowns[guildId]) cooldowns[guildId] = 0;
        if (Date.now() - cooldowns[guildId] < 5000) return; // 5 seconds

        for (const id in data[guildId]) {
            // get trigger data
            const entry = data[guildId][id];
            if (!entry.enabled) continue;
            if (!data[guildId]) continue;

            const trigger = entry.trigger;
            const input = message.content;
            
            // entry type
            let send = false;

            switch (entry.matchType) {
                case 'strict': // strict
                    send = trigger === input.trim();
                    break;
                case 'exact': // exact
                    send = trigger === input;
                    break;
                case 'regex': // regex
                    try { 
                        send = new RegExp(trigger, "i").test(input);
                    } catch(err) {
                        console.error(err)
                    }
                    break;
                case 'ends': // ends with
                    send = input.toLowerCase().endsWith(trigger.toLowerCase());
                    break;
                case 'starts': // starts with
                    send = input.toLowerCase().startsWith(trigger.toLowerCase());
                    break;
                case 'word': // word
                    try {
                        const escaped = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        send = new RegExp(`(^|\\W)${escaped}(\\W|$)`, 'i').test(input);
                    } catch(err) {
                        console.error(err)
                    }
                    break;
                case 'normal': default: // normal
                    send = input.toLowerCase().includes(trigger.toLowerCase());
                    break;
            }

            // response type
            let newReponse = entry.response;
            let reply = false;

            switch (entry.responseType) {
                case 'custom': // custom
                    newReponse = newReponse.replaceAll('{user.mention}', mentionUser(message.author));
                    newReponse = newReponse.replaceAll('{user.username}', message.author.name);
                    newReponse = newReponse.replaceAll('{user.nickname}', message.member.displayName);
                    break;
                case 'reply': // reply
                    reply = true;
                case 'normal': default: // normal
                    newReponse = entry.response;
                    break;
            }

            // send
            if (send) try {
                reply ? await message.reply(newReponse) : await message.channel.send(newReponse);
                cooldowns[guildId] = Date.now();
                break;
            } catch(err) {console.error(err)}
        }
    });
}

module.exports = { handleTriggers };