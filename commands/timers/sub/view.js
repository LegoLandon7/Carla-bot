// imports
const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson } = require('../../../utils/data/files.js');
const { hasPermission } = require('../../../utils/discord-utils/permissions.js');
const { msToDuration } = require('../../../utils/other/time.js');
const { COLORS, createEmbed} = require('../../../utils/discord-utils/embed.js');
const { mentionChannel } = require('../../../utils/discord-data/channel.js');
const path = require('path');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('view')
    .setDescription('Views a created timer')
    .addStringOption(o => 
        o.setName('id')
            .setDescription('The id of the timer to view')
            .setRequired(true));

// handler
const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const timerData = readJson(path.resolve(__dirname, '../../../data/timers.json'));

    let id = interaction.options.getString('id');

    const guildId = interaction.guild.id;
    const guildTimers = timerData[guildId];

    const entry = guildTimers[id];

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});
    if (!entry)
        return interaction.editReply({ content: `⚠️ no timer found with id \`${id}\`` });

    // output
    const output = `**ID: ** \`${id}\` | *${msToDuration(entry.timeMs)}* | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
        `- **Channel:** ${mentionChannel(interaction.guild.channels.cache.get(entry.channelId))}\n` +
        `- **Reset:** ${entry.messageReset ? `[YES] : ${entry.messageReset}` : (entry.sentReset ? '[YES]' : '[NO]')}\n` +
        `- **Response:** ${entry.response}`;

    // embed
    const embed = createEmbed(`⏲️ Timer: **${id}**`, output,
        COLORS.INFO, interaction.user, false, false, null);

    // message
    try { await interaction.editReply({ embeds: [embed] }); }
    catch (err) { await interaction.editReply({ content: "⚠️ Something went wrong"}); }
}

// exports
module.exports = { data, handler };