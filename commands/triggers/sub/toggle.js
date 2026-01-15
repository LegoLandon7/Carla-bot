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
            .setRequired(true))
    .addStringOption(o => 
        o.setName('choice')
            .setDescription('Choose to disable or enable (default is opposite)')
            .addChoices( 
                { name: 'Toggle', value: 'toggle' },
                { name: 'Enable', value: 'enable' },
                { name: 'Disable', value: 'disable' }
            ).setRequired(false));

const handler = async (interaction) => {
    await interaction.deferReply();

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    // data
    const id = interaction.options.getString('id');
    const choice = interaction.options.getString('choice') || 'toggle';

    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));

    // entry
    const guildId = interaction.guild.id;
    const entry = triggerData?.[guildId]?.[id]
    if (!entry)
        return interaction.editReply({ content: `⚠️ no trigger found with id ${'`' + id + '`'}` });
    const action = !entry.enabled;

    // toggle
    switch (choice) {
        case 'toggle': triggerData[guildId][id].enabled = action; break;
        case 'enable': triggerData[guildId][id].enabled = true; break;
        case 'disable': triggerData[guildId][id].enabled = false; break;
    }

    writeJson(path.resolve(path.resolve(__dirname, '../../../data/triggers.json')), triggerData);
    
    // message
    return interaction.editReply({ content: `✅ Succesfully ${action ? "**enabled**" : "**disabled**"} trigger with id: ${'`' + id + '`'}`});
};

module.exports = { data, handler };