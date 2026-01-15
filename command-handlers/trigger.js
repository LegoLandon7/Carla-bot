// imports
const { mentionUser } = require("../utils/user.js");
const { mentionChannel } = require("../utils/channel.js");
const { msToDiscordTimestamp, dateToDiscordTimestamp } = require("../utils/time.js");
const { ensureJson, readJson } = require("../utils/files.js");
const path = require('path');

// data
ensureJson(path.resolve(__dirname, '../data/triggers.json'));

let data = {};
let cooldowns = {};

async function handleTriggers(client) {
    client.on('messageCreate', async (message) => {
        if (message.length > 500) return;

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
            let newResponse = entry.response;
            let reply = false;

            switch (entry.responseType) {
                case 'custom': // custom
                    newResponse = newResponse.replaceAll('{author.mention}', mentionUser(message.author));
                    newResponse = newResponse.replaceAll('{author.username}', message.author.name);
                    newResponse = newResponse.replaceAll('{author.nickname}', message.member.displayName);
                    newResponse = newResponse.replaceAll('{author.message}', message);
                    newResponse = newResponse.replaceAll('{author.id}', message.author.id);
                    newResponse = newResponse.replaceAll('{author.avatar}', message.author.displayAvatarURL());
                    newResponse = newResponse.replaceAll('{author.tag}', message.author.tag);

                    newResponse = newResponse.replaceAll('{message.content}', message.content);
                    newResponse = newResponse.replaceAll('{message.length}', message.content.length.toString());
                    newResponse = newResponse.replaceAll('{message.id}', message.id);

                    newResponse = newResponse.replaceAll('{channel.name}', message.channel.name);
                    newResponse = newResponse.replaceAll('{channel.mention}', mentionChannel(message.channel));

                    newResponse = newResponse.replaceAll('{guild.name}', message.guild.name);
                    newResponse = newResponse.replaceAll('{guild.memberCount}', message.guild.memberCount.toString());

                    const now = Date.now();
                    newResponse = newResponse.replaceAll('{time.now}', dateToDiscordTimestamp(now, 'T'));
                    newResponse = newResponse.replaceAll('{time.relative}', dateToDiscordTimestamp(now, 'R'));
                    newResponse = newResponse.replaceAll('{date.now}', dateToDiscordTimestamp(now, 'D'));

                    const target = message.mentions.users.first();
                    if (target) {
                        newResponse = newResponse.replaceAll('{target.mention}', mentionUser(target));
                        newResponse = newResponse.replaceAll('{target.username}', target.name);
                    }

                    newResponse = newResponse.replaceAll('{trigger}', trigger);
                    break;
                case 'reply': // reply
                    reply = true;
                case 'normal': default: // normal
                    newResponse = entry.response;
                    break;
            }

            // send
            if (send) try {
                reply ? await message.reply(newResponse) : await message.channel.send(newResponse);
                cooldowns[guildId] = Date.now();
                break;
            } catch(err) {console.error(err)}
        }
    });
}

module.exports = { handleTriggers };