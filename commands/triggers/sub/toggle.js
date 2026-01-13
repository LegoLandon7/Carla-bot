const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { ensureJson, readJson, writeJson } = require('../../../utils/files.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { durationToMs, msToDuration } = require('../../../utils/time.js');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('toggle')
    .setDescription('Enables / disables a trigger')
    .addStringOption(o => 
        o.setName('id')
            .setDescription('The id of the trigger to toggle')
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
    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));

    // entry
    const guildId = interaction.guild.id;
    const entry = triggerData?.[guildId]?.[id]
    if (!entry) return interaction.editReply({content: `❌ Trigger with id ${'`' + id + '`'} not found.`});
    const action = !entry.enabled;

    // toggle
    triggerData[guildId][id].enabled = action;
    writeJson(path.resolve(path.resolve(__dirname, '../../../data/triggers.json')), triggerData);
    
    // message
    return interaction.editReply({ content: `✅ Succesfully ${action ? "**enabled**" : "**disabled**"} trigger with id: ${'`' + id + '`'}`});
};

module.exports = { data, handler };