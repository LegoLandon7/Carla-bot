const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { ensureJson, readJson, writeJson } = require('../../../utils/files.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { durationToMs, msToDuration } = require('../../../utils/time.js');
const { COLORS, createEmbed} = require('../../../utils/embed.js');
const { mentionChannel } = require('../../../utils/channel.js');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('view')
    .setDescription('Views a created trigger')
    .addStringOption(o => 
        o.setName('id')
            .setDescription('The id of the trigger to view')
            .setRequired(true));

const handler = async (interaction) => {
    await interaction.deferReply();

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    // data
    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));

    let id = interaction.options.getString('id');

    const guildId = interaction.guild.id;
    const guildTriggers = triggerData[guildId];

    const entry = guildTriggers[id];
    if (!entry)
        return interaction.editReply({ content: `⚠️ no trigger found with id ${'`' + id + '`'}` });

    const output = `${'`' + id + '`'} | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
        `- **Trigger:** ${entry.trigger}\n` +
        `- **Response:** ${entry.response}\n` +
        `- **Match Type:** [${entry.matchType.toUpperCase()}]\n` +
        `- **Response Type:** [${entry.responseType.toUpperCase()}]`;

    if (Object.keys(guildTriggers).length > 10) simplified = true;

    let embed = createEmbed(`⚡ Trigger: **${id}**`, output,
        COLORS.INFO, interaction.user, false, false, null );

    try { await interaction.editReply({ embeds: [embed] }); }
    catch (err) { await interaction.editReply({ content: "⚠️ Something went wrong"}); }
}

module.exports = { data, handler };