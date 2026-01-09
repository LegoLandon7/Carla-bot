const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { ensureJson, readJson, writeJson } = require('../../../utils/files.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { durationToMs, msToDuration } = require('../../../utils/time.js');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('delete')
    .setDescription('Deletes a timer')
    .addStringOption(option => 
        option
            .setName('id')
            .setDescription('The id of the timer to delete')
            .setRequired(true));

const handler = async (interaction) => {
    await interaction.deferReply();
    
    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageGuild))
        return interaction.editReply({ content: "❌ You need `Manage Guild` permission."});

    // data
    const id = interaction.options.getString('id');
    const timerData = readJson(path.resolve(__dirname, '../../../data/timers.json'));

    // entry
    const guildId = interaction.guild.id;
    const entry = timerData?.[guildId]?.[id]
    if (!entry) return interaction.editReply({content: `❌ Timer with id ${'`' + id + '`'} not found.`});

    // delete
    delete timerData[guildId][id];
    if (Object.keys(timerData[guildId]).length === 0)
        delete timerData[guildId];
    writeJson(path.resolve(path.resolve(__dirname, '../../../data/timers.json')), timerData);
    
    // message
    return interaction.editReply({ content: `✅ Succesfully deleted timer with id: ${'`' + id + '`'}`});
};

module.exports = { data, handler };