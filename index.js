// global
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { Client, GatewayIntentBits, Partials, Collection, ActivityType, PresenceUpdateStatus, Events, REST, Routes } = require('discord.js');

// client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        'MESSAGE', 
        'CHANNEL', 
        'REACTION', 
        'GUILD_MEMBER', 
        'USER'
    ]
});

const { retrieveCommands } = require('./init/retrieve-commands');
const { handleSlashCommands } = require('./init/execute-commands');
const { setPresence } = require('./init/set-presence');

const { handleTimers, handleTimersMessages } = require('./command-handlers/timer.js');

client.once('clientReady', () => {
    // initialization
    retrieveCommands(client);
    handleSlashCommands(client);
    setPresence(client);

    // command handlers
    handleTimers(client);
    setInterval(() => handleTimers(client), 5000); // 5 seconds
    handleTimersMessages(client);

    // message
    console.log(`✅ Logged in as ${client.user.tag}`);
});

const {ensureJson} = require('./utils/files.js');
ensureJson('../data/timers.json');

// login
client.login(process.env.BOT_TOKEN);