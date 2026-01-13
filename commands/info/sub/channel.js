const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS, createEmbed} = require('../../../utils/embed.js');
const { dateToDiscordTimestamp } = require('../../../utils/time.js');
const { fetchMembers } = require('../../../utils/fetch.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('channel')
    .setDescription('Shows the info of a role')
    .addChannelOption(o =>
        o.setName('target_channel')
            .setDescription('The channel to get info for')
            .setRequired(true)
    );

const handler = async (interaction) => {
    await interaction.deferReply();

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    fetchMembers(interaction.guild);
    const user = interaction.user;
    const channel = interaction.options.getChannel('target_channel');
    const creationDate = dateToDiscordTimestamp(channel.createdAt);

    // embed
    const embed = createEmbed(`📝 **${channel.name}'s** Information`,
        `**• Mention:** ${channel.url}\n` +
        `**• Name:** *${channel.name}*\n` +
        `**• ID:** ${'`' + channel.id + '`'}\n` +
        `**• Channel Creation:** ${creationDate}\n` +
        `**• Members:** ${channel.permissionOverwrites.cache.filter(o => o.type === 0).size}\n`,
        COLORS.INFO, user, false, null, null);

    await interaction.editReply({ embeds: [embed] });
};

module.exports = { data, handler };