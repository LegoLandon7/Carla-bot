const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { ensureJson, readJson, writeJson } = require('../../../utils/files.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { durationToMs, msToDuration } = require('../../../utils/time.js');
const { COLORS, createEmbed} = require('../../../utils/embed.js');
const { mentionChannel } = require('../../../utils/channel.js');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('view')
    .setDescription('Views all created timers');

const handler = async (interaction) => {
    await interaction.deferReply();

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageGuild))
        return interaction.editReply({ content: "❌ You need `Manage Guild` permission."});

    // data
    const timerData = readJson(path.resolve(__dirname, '../../../data/timers.json'));

    const guildId = interaction.guild.id;
    const guildTimers = timerData[guildId];

    if (!guildTimers || Object.keys(guildTimers).length === 0)
        return interaction.editReply({ content: "❌ no timers for this server" });

    const output = [];

    for (const id in guildTimers) {
        const entry = guildTimers[id];
        output.push(`${'`' + id + '`'} | *${msToDuration(entry.timeMs)}* | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n- **Channel: **${mentionChannel(interaction.guild.channels.cache.get(entry.channelId))}\n- **Reset: **${entry.messageReset ? ` [YES] : ${entry.messageReset}` : (entry.sentReset ? '[YES]' : '[NO]')}\n- **Message: **${entry.message}`);
    }

    const embed = createEmbed(`⏲️ **${interaction.guild.name}'s** Timers`, output.join('\n'),
        COLORS.INFO, interaction.user, false, false, null );

    await interaction.editReply({ embeds: [embed] });
}

module.exports = { data, handler };