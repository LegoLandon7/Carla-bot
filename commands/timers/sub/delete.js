const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson, writeJson } = require('../../../utils/data/files.js');
const { hasPermission } = require('../../../utils/discord-utils/permissions.js');
const path = require('path');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('delete')
    .setDescription('Deletes a timer')
    .addStringOption(o => 
        o.setName('id')
            .setDescription('The id of the timer to delete')
            .setRequired(true));

// handler
const handler = async (interaction) => {
    await interaction.deferReply();
    
    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    // data
    const id = interaction.options.getString('id');
    const timerData = readJson(path.resolve(__dirname, '../../../data/timers.json'));

    // entry
    const guildId = interaction.guild.id;
    const entry = timerData?.[guildId]?.[id]
    if (!entry) 
        return interaction.editReply({ content: `⚠️ no timer found with id \`${id}\`` });

    // delete
    delete timerData[guildId][id];
    if (Object.keys(timerData[guildId]).length === 0)
        delete timerData[guildId];
    writeJson(path.resolve(path.resolve(__dirname, '../../../data/timers.json')), timerData);
    
    // message
    return interaction.editReply({ content: `✅ Succesfully deleted timer with id: \`${id}\``});
};

// exports
module.exports = { data, handler };