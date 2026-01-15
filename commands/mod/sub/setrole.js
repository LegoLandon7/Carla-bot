const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('editrole')
    .setDescription('Adds or removes a role from a user')
    .addStringOption(o =>
        o.setName('target_user')
         .setDescription('User to edit the role of')
         .setRequired(true))
    .addRoleOption(o =>
        o.setName('role')
         .setDescription('The role to toggle for the user')
         .setRequired(true));

const handler = async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    const userData = await getCommandUserData(interaction);
    if (!userData) return; const { user, member, commandUser, botMember } = userData;

    const role = interaction.options.getRole('role');

    // permissions
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageRoles))
        return interaction.editReply({ content: "❌ You need `Manage Roles` permission."});
    if (user.bot)
        return interaction.editReply({ content: "❌ You can't edit roles of bots." });

    // role hierarchy
    if (commandUser.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has higher or equal role than you."});
    if (botMember.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has higher or equal role than me."});

    // edit role
    try {
        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            return interaction.editReply({
                content: `➖ Removed **${role.name}** from **${user.tag}**`
            });
        } else {
            await member.roles.add(role);
            return interaction.editReply({
                content: `➕ Added **${role.name}** to **${user.tag}**`
            });
        }
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Couldn't edit role."});
    }
};

module.exports = { data, handler };