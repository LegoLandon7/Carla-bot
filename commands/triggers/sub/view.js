// imports
const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson } = require('../../../utils/data/files.js');
const { hasPermission } = require('../../../utils/discord-utils/permissions.js');;
const { COLORS, createEmbed} = require('../../../utils/discord-utils/embed.js');
const path = require('path');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('view')
    .setDescription('Views a created trigger')
    .addStringOption(o => 
        o.setName('id')
            .setDescription('The id of the trigger to view')
            .setRequired(true));

// subcommand
const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));

    let id = interaction.options.getString('id');

    const guildId = interaction.guild.id;
    const guildTriggers = triggerData[guildId];

    const entry = guildTriggers[id];

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});
    if (!entry)
        return interaction.editReply({ content: `⚠️ no trigger found with id \`${id}\`` });

    // output
    const output = `**ID: **\`${id}\` | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
        `- **Trigger:** ${entry.trigger}\n` +
        `- **Response:** ${entry.response}\n` +
        `- **Match Type:** [${entry.matchType.toUpperCase()}]\n` +
        `- **Response Type:** [${entry.responseType.toUpperCase()}]`;

    // embed
    let embed = createEmbed(`⚡ Trigger: **${id}**`, output,
        COLORS.INFO, interaction.user, false, false, null);

    // message
    try { await interaction.editReply({ embeds: [embed] }); }
    catch (err) { await interaction.editReply({ content: "⚠️ Something went wrong"}); }
}

// exports
module.exports = { data, handler };