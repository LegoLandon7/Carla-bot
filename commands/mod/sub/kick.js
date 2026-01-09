const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addStringOption(o =>
        o.setName('target_user')
         .setDescription('User to kick (mention, ID, or username)')
         .setRequired(true))
    .addStringOption(o =>
        o.setName('reason')
         .setDescription('Reason to kick')
         .setRequired(false));

const handler = async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // data
    const userData = await getCommandUserData(interaction);
    if (!userData) return; const { user, member, commandUser, botMember } = userData;

    const reason = interaction.options.getString('reason') || 'No reason provided';

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(commandUser, PermissionFlagsBits.KickMembers))
        return interaction.editReply({ content: "❌ You need `Kick Members` permission."});
    if (!botHasPermission(interaction.client, interaction.guild, PermissionFlagsBits.KickMembers))
        return interaction.editReply({ content: "❌ I don’t have permission to kick members."});

    // role hierarchy
    if (commandUser.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has higher or equal role than you."});
    if (botMember.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has higher or equal role than me."});

    // self checks
    if (user.id === interaction.client.user.id)
        return interaction.editReply({ content: "❌ Cannot kick myself."});
    if (interaction.user.id === user.id)
        return interaction.editReply({ content: "❌ Cannot kick yourself."});
    if (user.bot)
        return interaction.editReply({ content: "❌ Cannot kick a bot."});

    // dm
    user.send(`❌ You have been kicked from **${interaction.guild.name}** for: ${reason}`)
        .catch(() => console.log(`⚠️ Could not DM ${user.tag}`));

    // kick
    try {
        await member.kick({ reason });
        return interaction.editReply({ content: `✅ Successfully kicked ${user.tag}`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Couldn't kick user."});
    }
};

module.exports = { data, handler };