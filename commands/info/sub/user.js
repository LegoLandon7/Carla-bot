const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS, createEmbed} = require('../../../utils/embed.js');
const { getRoles } = require('../../../utils/role.js');
const { dateToDiscordTimestamp } = require('../../../utils/time.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('user')
    .setDescription('Shows the info of a user')
    .addUserOption(option => 
        option
            .setName('target_user')
            .setDescription('The user to get the info from, leave blank to default to you')
            .setRequired(false));

const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const user = interaction.options.getUser('target_user') || interaction.user;
    const member = interaction.options.getMember('target_user') || interaction.member;

    const avatarURL = user.displayAvatarURL({ size: 1024, dynamic: true });
    const roles = getRoles(member, interaction);

     const dateJoined = dateToDiscordTimestamp(member.joinedAt);
    const dateMade = dateToDiscordTimestamp(user.createdAt);

    // embed
    const embed = createEmbed(`📝 **${user.tag}'s** Information`,
        `**• Mention:** ${user}\n` +
        `**• Username:** *${user.tag}*\n` +
        `**• Nickname:** ${member.nickname ? `*${member.nickname}*` : '[NONE]'}\n` +
        `**• ID:** *${user.id}*\n` +
        `**• Is Bot:** ${user.bot ? '[YES]' : '[NO]'}\n` +
        `**• Is Boosting:** ${member.premiumSince ? '[YES]' : '[NO]'}\n` +
        `**• Server Join Date:** ${dateJoined}\n` +
        `**• Account Creation:** ${dateMade}\n` +
        `**• Avatar:** [AVATAR](${avatarURL})\n` +
        `**• Roles:** ${roles}\n`,
        COLORS.INFO, user, false, avatarURL, null);

    await interaction.editReply({ embeds: [embed] });
};

module.exports = { data, handler };