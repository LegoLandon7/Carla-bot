const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson } = require('../../../utils/files.js');
const { hasPermission } = require('../../../utils/permissions.js');
const { msToDuration } = require('../../../utils/time.js');
const { COLORS, createEmbed } = require('../../../utils/embed.js');
const { mentionChannel } = require('../../../utils/channel.js');
const { Pagination } = require('pagination.djs');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('Views all created timers')
    .addBooleanOption(o =>
        o.setName('simplified')
            .setDescription('Simplify the view')
            .setRequired(false)
    );

const handler = async (interaction) => {
    await interaction.deferReply();

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ this command can only be used in servers." });

    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ you need `Manage Messages` permission." });

    // read timer data
    const timerData = readJson(path.resolve(__dirname, '../../../data/timers.json'));

    const simplified = interaction.options.getBoolean('simplified') || false;
    const guildId = interaction.guild.id;
    const guildTimers = timerData[guildId];

    if (!guildTimers || Object.keys(guildTimers).length === 0)
        return interaction.editReply({ content: "❌ no timers for this server" });

    // pagination settings
    const pageSize = 5; // entries per page
    const timers = Object.entries(guildTimers);
    const totalEntries = timers.length;
    const totalPages = Math.ceil(totalEntries / pageSize);

    const timerEmbeds = [];

    // build all pages
    for (let i = 0; i < totalEntries; i += pageSize) {
        const slice = timers.slice(i, i + pageSize);

        // build description for each entry
        const description = slice.map(([id, entry]) => {
            if (simplified) {
                return `${'`' + id + '`'} | *${msToDuration(entry.timeMs)}* | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}`;
            } else {
                return `${'`' + id + '`'} | *${msToDuration(entry.timeMs)}* | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
                    `- **Channel:** ${mentionChannel(interaction.guild.channels.cache.get(entry.channelId))}\n` +
                    `- **Reset:** ${entry.messageReset ? `[YES] : ${entry.messageReset}` : (entry.sentReset ? '[YES]' : '[NO]')}\n` +
                    `- **Response:** ${entry.response}`;
            }
        }).join('\n\n');

        const startEntry = i + 1;
        const endEntry = Math.min(i + pageSize, totalEntries);
        const currentPage = Math.floor(i / pageSize) + 1;

        // create embed
        const embed = createEmbed(
            `⏲️ **${interaction.guild.name}'s** Timers - Page (${currentPage}/${totalPages})`,
            description, COLORS.INFO, interaction.user, false, false, null
        ).setFooter({ text: `Showing ${startEntry}-${endEntry} of ${totalEntries} entries` });

        timerEmbeds.push(embed);
    }

    // render pagination
    const pagination = new Pagination(interaction)
        .setEmbeds(timerEmbeds)
        .setAuthorizedUsers([interaction.user.id])
        .setIdle(60000) // 60 seconds
        .render();
};

module.exports = { data, handler };