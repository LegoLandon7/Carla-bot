const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson } = require('../../../utils/files.js');
const { hasPermission } = require('../../../utils/permissions.js');
const { COLORS, createEmbed } = require('../../../utils/embed.js');
const { Pagination } = require('pagination.djs');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('Views all created triggers')
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

    // read trigger data
    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));

    let simplified = interaction.options.getBoolean('simplified') || false;
    const guildId = interaction.guild.id;
    const guildTriggers = triggerData[guildId];

    if (!guildTriggers || Object.keys(guildTriggers).length === 0)
        return interaction.editReply({ content: "❌ no triggers for this server" });

    // pagination settings
    const pageSize = 5; // 10 entries per page
    const triggers = Object.entries(guildTriggers);
    const totalEntries = triggers.length;
    const totalPages = Math.ceil(totalEntries / pageSize);
    const triggerEmbeds = [];

    // build all pages
    for (let i = 0; i < totalEntries; i += pageSize) {
        const slice = triggers.slice(i, i + pageSize);

        // build description for each entry
        const description = slice.map(([id, entry]) => {
            if (simplified) {
                return `${'`' + id + '`'} | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}`;
            } else {
                return `${'`' + id + '`'} | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
                    `- **Trigger:** ${entry.trigger}\n` +
                    `- **Response:** ${entry.response}\n` +
                    `- **Match Type:** [${entry.matchType.toUpperCase()}]\n` +
                    `- **Response Type:** [${entry.responseType.toUpperCase()}]`;
            }
        }).join('\n\n');

        const startEntry = i + 1;
        const endEntry = Math.min(i + pageSize, totalEntries);
        const currentPage = Math.floor(i / pageSize) + 1;

        // create embed
        const embed = createEmbed(
            `⚡ **${interaction.guild.name}'s** Triggers - Page (${currentPage}/${totalPages})`,
            description, COLORS.INFO, interaction.user, false, false, null
        ).setFooter({ text: `Showing ${startEntry}-${endEntry} of ${totalEntries} entries` });

        triggerEmbeds.push(embed);
    }

    // render pagination
    const pagination = new Pagination(interaction)
        .setEmbeds(triggerEmbeds)
        .setAuthorizedUsers([interaction.user.id])
        .setIdle(60000) // 60 seconds
        .render();
};

module.exports = { data, handler };