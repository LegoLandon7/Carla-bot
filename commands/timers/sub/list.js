// imports
const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson } = require('../../../utils/data/files.js');
const { hasPermission } = require('../../../utils/discord-utils/permissions.js');
const { msToDuration } = require('../../../utils/other/time.js');
const { mentionChannel } = require('../../../utils/discord-data/channel.js');
const { multiPageObjectEmbed } = require('../../../utils/discord-utils/embed.js');
const path = require('path');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('Views all created timers');

// handler
const handler = async (interaction) => {
    await interaction.deferReply();

    // read timer data
    const timerData = readJson(path.resolve(__dirname, '../../../data/timers.json'));

    const guildId = interaction.guild.id;
    const guildTimers = timerData[guildId];

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ this command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ you need `Manage Messages` permission." });
    if (!guildTimers || Object.keys(guildTimers).length === 0)
        return interaction.editReply({ content: "❌ no timers for this server" });

    // create trigger list
    const timerList = new multiPageObjectEmbed(interaction, guildTimers, 'Timers', (id, entry) => {
        if (!id || !entry) return null;
        return `**ID: ** \`${id}\` | *${msToDuration(entry.timeMs)}* | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
            `- **Channel:** ${mentionChannel(interaction.guild.channels.cache.get(entry.channelId))}\n` +
            `- **Reset:** ${entry.messageReset ? `[YES] : ${entry.messageReset}` : (entry.sentReset ? '[YES]' : '[NO]')}\n` +
            `- **Response:** ${entry.response}`;
    });

    // render timer list
    timerList.render(interaction);
};

// exports
module.exports = { data, handler };