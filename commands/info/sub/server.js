const { SlashCommandSubcommandBuilder } = require('discord.js');
const { COLORS, createEmbed } = require('../../../utils/embed.js');
const { dateToDiscordTimestamp } = require('../../../utils/time.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('server')
    .setDescription('Shows the info of the server')
    .addStringOption(o =>
        o.setName('server_id')
            .setDescription('Optional server ID to fetch info for')
            .setRequired(false)
    );

const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const user = interaction.user;

    const serverId = interaction.options.getString('server_id');
    const guild = serverId ? interaction.client.guilds.cache.get(serverId) : interaction.guild;
    if (!guild) return interaction.editReply( { content: '❌ Server not found or I am not in that server.'});

    const iconURL = guild.iconURL({ size: 1024, dynamic: true }) || null;
    const owner = await guild.fetchOwner();
    const createdAt = dateToDiscordTimestamp(guild.createdAt, 'f');

    const totalMembers = guild.memberCount;
    const totalChannels = guild.channels.cache.size;

    const boostCount = guild.premiumSubscriptionCount;
    const boostLevel = guild.premiumTier;

    // embed
    const embed = createEmbed(`📝 **${guild.name}'s** Information`,
        `**- Name:** *${guild.name}*\n` +
        `**- ID:** ${'`' + guild.id + '`'}\n` +
        `**- Owner:** *${owner.user.tag}*\n` +
        `**- Members:** *${totalMembers}*\n` +
        `**- Channels:** *${totalChannels}*\n` +
        `**- Boosts:** ${boostCount} (Level ${boostLevel})\n` +
        `**- Server Creation:** ${createdAt}\n` +
        `**- Icon:** [ICON](${iconURL})\n`,
        COLORS.INFO, user, false, iconURL, null
    );

    await interaction.editReply({ embeds: [embed]});
};

module.exports = { data, handler };