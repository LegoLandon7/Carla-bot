const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .addStringOption(o =>
        o.setName('target_user')
         .setDescription('User to ban (mention, ID, or username)')
         .setRequired(true))
    .addStringOption(o =>
        o.setName('reason')
         .setDescription('Reason to ban')
         .setRequired(false));

const handler = async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    const userData = await getCommandUserData(interaction);
    if (!userData) return; const { user, member, commandUser, botMember } = userData;

    const reason = interaction.options.getString('reason') || 'No reason provided';

    // permissions
    if (!hasPermission(commandUser, PermissionFlagsBits.BanMembers))
        return interaction.editReply({ content: "❌ You need `Ban Members` permission."});
    if (!botHasPermission(interaction.client, interaction.guild, PermissionFlagsBits.BanMembers))
        return interaction.editReply({ content: "❌ I don’t have permission to ban members."});

    // already banned
    if (await interaction.guild.bans.fetch(user.id).catch(() => null))
        return interaction.editReply({ content: "❌ User is already banned."});

    // role hierarchy
    if (commandUser.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has higher or equal role than you."});
    if (botMember.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has higher or equal role than me."});

    // self checks
    if (user.id === interaction.client.user.id)
        return interaction.editReply({ content: "❌ Cannot ban myself."});
    if (interaction.user.id === user.id)
        return interaction.editReply({ content: "❌ Cannot ban yourself."});
    if (user.bot)
        return interaction.editReply({ content: "❌ Cannot ban a bot."});

    // dm
    user.send(`❌ You have been banned from **${interaction.guild.name}** for: ${reason}`)
        .catch(() => console.log(`⚠️ Could not DM ${user.tag}`));

    // ban
    try {
        await member.ban({ reason });
        return interaction.editReply({ content: `✅ Successfully banned ${user.tag}`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Couldn't ban user."});
    }
};

module.exports = { data, handler };