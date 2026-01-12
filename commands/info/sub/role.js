const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS, createEmbed} = require('../../../utils/embed.js');
const { dateToDiscordTimestamp } = require('../../../utils/time.js');
const { fetchMembers } = require('../../../utils/fetch.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('role')
    .setDescription('Shows the info of a role')
    .addRoleOption(o =>
        o.setName('target_role')
            .setDescription('The role to get info for')
            .setRequired(true)
    );

const handler = async (interaction) => {
    await interaction.deferReply();

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    fetchMembers(interaction.guild);
    const user = interaction.user;
    const role = interaction.options.getRole('target_role');
    const iconURL = role.iconURL({ size: 1024, dynamic: true }) || null;
    const creationDate = dateToDiscordTimestamp(role.createdAt);
    // embed
    const embed = createEmbed(`📝 **${role.name}'s** Information`,
        `**• Mention:** ${role}\n` +
        `**• Name:** *${role.name}*\n` +
        `**• ID:** *${role.id}*\n` +
        `**• Color:** *${role.hexColor}*\n` +
        `**• Hoisted:** *${role.hoist ? '[YES]' : '[NO]'}*\n` +
        `**• Mentionable:** *${role.mentionable ? '[YES' : '[NO]'}*\n` +
        `**• Role Creation:** ${creationDate}\n` +
        `**• Members:** ${role.members.size}\n`,
        COLORS.INFO, user, false, iconURL, null);

    await interaction.editReply({ embeds: [embed] });
};

module.exports = { data, handler };