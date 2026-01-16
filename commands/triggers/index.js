// imports
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// command
const data = new SlashCommandBuilder()
    .setName('triggers')
    .setDescription('Trigger commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setContexts(0);

const subHandlers = {};
const subPath = path.join(__dirname, 'sub');

// load all sub files
const subcommandFiles = fs
    .readdirSync(subPath)
    .filter(file => file.endsWith('.js'));

for (const file of subcommandFiles) {
    const sub = require(path.join(subPath, file));

    if (sub.data && sub.handler) {
        data.addSubcommand(sub.data);
        subHandlers[sub.data.name] = sub.handler;
    }
}

// exports
module.exports = { data, subHandlers };