// imports
const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson, writeJson } = require('../../../utils/data/files.js');
const { hasPermission } = require('../../../utils/discord-utils/permissions.js');
const path = require('path');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('clear')
    .setDescription('Deletes all triggers');

// handler
const handler = async (interaction) => {
    await interaction.deferReply();
    
    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    // data
    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));
    const guildId = interaction.guild.id;

    // delete
    delete triggerData[guildId];
    writeJson(path.resolve(path.resolve(__dirname, '../../../data/triggers.json')), triggerData);
    
    // message
    return interaction.editReply({ content: "✅ Succesfully deleted all triggers."});
};

// exports
module.exports = { data, handler };