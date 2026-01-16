const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson, writeJson } = require('../../../utils/data/files.js');
const { hasPermission } = require('../../../utils/discord-utils/permissions.js');
const path = require('path');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('toggle')
    .setDescription('Enables / disables a timer')
    .addStringOption(o => 
        o.setName('id')
            .setDescription('The id of the timer to toggle')
            .setRequired(true))
    .addStringOption(o => 
        o.setName('choice')
            .setDescription('Choose to disable or enable (default is opposite)')
            .addChoices( 
                { name: 'Toggle', value: 'toggle' },
                { name: 'Enable', value: 'enable' },
                { name: 'Disable', value: 'disable' }
            ).setRequired(false));

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
    const choice = interaction.options.getString('choice') || 'toggle';

    const timerData = readJson(path.resolve(__dirname, '../../../data/timers.json'));

    // entry
    const guildId = interaction.guild.id;
    const entry = timerData?.[guildId]?.[id]
    if (!entry) 
        return interaction.editReply({ content: `⚠️ no timer found with id \`${id}\`` });
    const action = !entry.enabled;

    // toggle
    switch (choice) {
        case 'toggle': timerData[guildId][id].enabled = action; break;
        case 'enable': timerData[guildId][id].enabled = true; break;
        case 'disable': timerData[guildId][id].enabled = false; break;
    }

    // write data
    writeJson(path.resolve(path.resolve(__dirname, '../../../data/timers.json')), timerData);
    
    // message
    return interaction.editReply({ content: `✅ Succesfully ${action ? "**enabled**" : "**disabled**"} timer with id: \`${id}\``});
};

// exports
module.exports = { data, handler };