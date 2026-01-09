const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS, createEmbed} = require('../../../utils/embed.js');
const { mentionUser } = require('../../../utils/user.js');
const { dateToDiscordTimestamp } = require('../../../utils/time.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('bot')
    .setDescription('Shows the info of the bot');

const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const user = interaction.client.user;
    const size = interaction.client.guilds.cache.size
    const uptime = Math.floor(process.uptime() / 60);
    const memory = (Math.round(process.memoryUsage().rss / 1024 / 1024)) + "MB";

    const avatarURL = user.displayAvatarURL({ size: 1024, dynamic: true });
    const gitURL = 'https://github.com/LegoLandon7/Cosmos';
    const inviteURL = 'https://discord.com/oauth2/authorize?client_id=1445762036087914677&permissions=8&integration_type=0&scope=bot';
    const dateMade = dateToDiscordTimestamp(user.createdAt);

    // embed
    const embed = createEmbed(`📝 **${user.tag}'s** Information`,
        `**• Mention:** ${mentionUser(user)}\n` +
        `**• Username:** *${user.tag}*\n` +
        `**• ID:** *${user.id}*\n` +
        `**• Owner:** *cc_landonlego*\n` +
        `**• Guilds:** *${size}*\n` +
        `**• Uptime:** *${uptime}m*\n` +
        `**• Memory Usage:** *${memory}*\n` +
        `**• Bot Creation:** ${dateMade}\n` +
        `**• Links:** [Avatar](${avatarURL}) • [Github](${gitURL}) • [Invite](${inviteURL})`,
        COLORS.INFO, user, false, avatarURL, null);

    await interaction.editReply({ embeds: [embed] });
};

module.exports = { data, handler };