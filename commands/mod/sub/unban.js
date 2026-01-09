const { SlashCommandSubcommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('unban')
    .setDescription('Unbans a user')
    .addStringOption(o =>
        o.setName('target_user')
         .setDescription('User to unban (mention, ID, or username)')
         .setRequired(true)
    )
    .addStringOption(o =>
        o.setName('reason')
         .setDescription('Reason for unbanning')
         .setRequired(false)
    );

const handler = async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    const userData = await getCommandUserData(interaction);
    if (!userData) return; const { user, member, commandUser, botMember } = userData;

    const reason = interaction.options.getString('reason') || 'No reason provided';

    // permissions
    if (!hasPermission(interaction.member, PermissionFlagsBits.BanMembers))
        return interaction.editReply({ content: "❌ You need `Ban Members` permission."});
    if (!botHasPermission(interaction.client, interaction.guild, PermissionFlagsBits.BanMembers))
        return interaction.editReply({ content: "❌ I don’t have permission to unban members."});

    // check if banned
    if (!await interaction.guild.bans.fetch(user.id).catch(() => null))
        return interaction.editReply({ content: "❌ That user is not banned."});

    // unban
    try {
        await interaction.guild.members.unban(user.id, reason);
        return interaction.editReply({content: `✅ Successfully **unbanned** **${user.tag}**`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Failed to unban user."});
    }
};

module.exports = { data, handler };
