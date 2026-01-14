const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { ensureJson, readJson, writeJson } = require('../../../utils/files.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { durationToMs, msToDuration } = require('../../../utils/time.js');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('toggle')
    .setDescription('Enables / disables a timer')
    .addStringOption(o => 
        o.setName('id')
            .setDescription('The id of the timer to toggle')
            .setRequired(true));

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
    if (!entry) return interaction.editReply({content: `❌ Timer with id ${'`' + id + '`'} not found.`});
    const action = !entry.enabled;

    // toggle
    timerData[guildId][id].enabled = action;
    writeJson(path.resolve(path.resolve(__dirname, '../../../data/timers.json')), timerData);
    
    // message
    return interaction.editReply({ content: `✅ Succesfully ${action ? "**enabled**" : "**disabled**"} timer with id: ${'`' + id + '`'}`});
};

module.exports = { data, handler };