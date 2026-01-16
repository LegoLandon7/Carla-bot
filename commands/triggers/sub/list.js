// imports
const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson } = require('../../../utils/data/files.js');
const { hasPermission } = require('../../../utils/discord-utils/permissions.js');
const { multiPageObjectEmbed } = require('../../../utils/discord-utils/embed.js');
const path = require('path');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('Views all created triggers');

// handler
const handler = async (interaction) => {
    await interaction.deferReply();

    // read trigger data
    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));

    const guildId = interaction.guild.id;
    const guildTriggers = triggerData[guildId];

    // permissions / checks
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ you need `Manage Messages` permission." });
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ this command can only be used in servers." });
    if (!guildTriggers || Object.keys(guildTriggers).length === 0)
        return interaction.editReply({ content: "❌ no triggers are set for this server." });

    // create trigger list
    const triggerList = new multiPageObjectEmbed(interaction, guildTriggers, 'Triggers', (id, entry) => {
        if (!id || !entry) return null;
        return `**ID: **\`${id}\` | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
            `- **Trigger:** ${entry.trigger}\n` +
            `- **Response:** ${entry.response}\n` +
            `- **Match Type:** [${entry.matchType.toUpperCase()}]\n` +
            `- **Response Type:** [${entry.responseType.toUpperCase()}]`;
    });

    // render trigger list
    triggerList.render(interaction);
};

// exports
module.exports = { data, handler };