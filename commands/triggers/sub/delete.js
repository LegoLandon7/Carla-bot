// imports
const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson, writeJson } = require('../../../utils/data/files.js');
const { hasPermission } = require('../../../utils/discord-utils/permissions.js');
const path = require('path');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('delete')
    .setDescription('Deletes a trigger')
    .addStringOption(o => 
        o.setName('id')
            .setDescription('The id of the trigger to delete')
            .setRequired(true));

// subcommand
const handler = async (interaction) => {
    await interaction.deferReply();
    
    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    // data
    const id = interaction.options.getString('id');
    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));

    // entry
    const guildId = interaction.guild.id;
    const entry = triggerData?.[guildId]?.[id]
    if (!entry)
        return interaction.editReply({ content: `⚠️ no trigger found with id \`${id}\`` });

    // delete
    delete triggerData[guildId][id];
    if (Object.keys(triggerData[guildId]).length === 0)
        delete triggerData[guildId];
    writeJson(path.resolve(path.resolve(__dirname, '../../../data/triggers.json')), triggerData);
    
    // message
    return interaction.editReply({ content: `✅ Succesfully deleted trigger with id: \`${id}\``});
};

// exports
module.exports = { data, handler };