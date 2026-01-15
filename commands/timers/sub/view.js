const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { ensureJson, readJson, writeJson } = require('../../../utils/files.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { durationToMs, msToDuration } = require('../../../utils/time.js');
const { COLORS, createEmbed} = require('../../../utils/embed.js');
const { mentionChannel } = require('../../../utils/channel.js');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('view')
    .setDescription('Views a created timer')
    .addStringOption(o => 
        o.setName('id')
            .setDescription('The id of the timer to view')
            .setRequired(true));

const handler = async (interaction) => {
    await interaction.deferReply();

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    // data
    const timerData = readJson(path.resolve(__dirname, '../../../data/timers.json'));

    let id = interaction.options.getString('id');

    const guildId = interaction.guild.id;
    const guildTimers = timerData[guildId];

    const entry = guildTimers[id];
    if (!entry)
        return interaction.editReply({ content: `⚠️ no timer found with id ${'`' + id + '`'}` });

    const output = `${'`' + id + '`'} | *${msToDuration(entry.timeMs)}* | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
        `- **Channel:** ${mentionChannel(interaction.guild.channels.cache.get(entry.channelId))}\n` +
        `- **Reset:** ${entry.messageReset ? `[YES] : ${entry.messageReset}` : (entry.sentReset ? '[YES]' : '[NO]')}\n` +
        `- **Response:** ${entry.response}`;

    const embed = createEmbed(`⏲️ Timer: **${id}}**`, output,
        COLORS.INFO, interaction.user, false, false, null );

    try { await interaction.editReply({ embeds: [embed] }); }
    catch (err) { await interaction.editReply({ content: "⚠️ Something went wrong"}); }
}

module.exports = { data, handler };