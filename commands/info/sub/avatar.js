const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS, createEmbed} = require('../../../utils/embed.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('avatar')
    .setDescription('Shows the avatar of a user')
    .addUserOption(option => 
        option
            .setName('target_user')
            .setDescription('The user to get the avatar from, leave blank to default to you')
            .setRequired(false));

const handler = async (interaction) => {
    await interaction.deferReply();

    const user = interaction.options.getUser('target_user') || interaction.user;

    const avatarURL = user.displayAvatarURL({ size: 1024, dynamic: true });
    const png = user.displayAvatarURL({ extension: 'png', size: 1024 });
    const jpg = user.displayAvatarURL({ extension: 'jpg', size: 1024 });
    const webp = user.displayAvatarURL({ extension: 'webp', size: 1024 });

    const embed = createEmbed(`🖼️ **${user.tag}'s** Avatar`, `[PNG](${png}) | [JPG](${jpg}) | [WEBP](${webp})`,
        COLORS.INFO, user, false, false, avatarURL);

    await interaction.editReply({ embeds: [embed] });
};

module.exports = { data, handler };