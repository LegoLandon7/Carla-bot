const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { ensureJson, readJson, writeJson } = require('../../../utils/files.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { durationToMs, msToDuration } = require('../../../utils/time.js');
const { COLORS, createEmbed} = require('../../../utils/embed.js');
const { mentionChannel } = require('../../../utils/channel.js');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('Views all created triggers')
    .addBooleanOption(o => 
        o.setName('simplified')
            .setDescription('Simplify the view (automatically applied with over 10 entries)')
            .setRequired(false));

const handler = async (interaction) => {
    await interaction.deferReply();

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageGuild))
        return interaction.editReply({ content: "❌ You need `Manage Guild` permission."});

    // data
    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));

    let simplified = interaction.options.getBoolean('simplified') || false;

    const guildId = interaction.guild.id;
    const guildTriggers = triggerData[guildId];

    if (!guildTriggers || Object.keys(guildTriggers).length === 0)
        return interaction.editReply({ content: "❌ no triggers for this server" });

    if (Object.keys(guildTriggers).length > 10) simplified = true;

    const output = [];

    for (const id in guildTriggers) {
        const entry = guildTriggers[id];
        if (simplified) {
            output.push(`${'`' + id + '`'} | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}`);
        } else {
            output.push(
                `${'`' + id + '`'} | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
                `- **Trigger:** ${entry.trigger}\n` +
                `- **Response:** ${entry.response}\n` +
                `- **Match Type:** [${entry.matchType.toUpperCase()}]`
            );
        }
    }

    let embed = createEmbed(`⏲️ **${interaction.guild.name}'s** Triggers`, output.join('\n'),
        COLORS.INFO, interaction.user, false, false, null );

    try { await interaction.editReply({ embeds: [embed] }); }
    catch (err) { await interaction.editReply({ content: "⚠️ Something went wrong"}); }
}

module.exports = { data, handler };