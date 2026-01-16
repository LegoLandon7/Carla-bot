// imports
const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/discord-data/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/discord-utils/permissions.js');
const { PermissionFlagsBits } = require('discord.js');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('setnick')
    .setDescription('Sets a nickname of a user')
    .addStringOption(o =>
        o.setName('target_user')
         .setDescription('User to change the nickname of (mention, ID, or username)')
         .setRequired(true))
    .addStringOption(o =>
        o.setName('nickname')
         .setDescription('Nickname to change to, leave blank to reset')
         .setRequired(false));

// handler
const handler = async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    const userData = await getCommandUserData(interaction);
    if (!userData) return; const { user, member, commandMember, botMember } = userData;

    const nickname = interaction.options.getString('nickname') || null;

    // permissions
    if (!hasPermission(commandMember, PermissionFlagsBits.ManageNicknames))
        return interaction.editReply({ content: "❌ You need `Manage Nicknames` permission."});
    if (!botHasPermission(interaction.client, interaction.guild, PermissionFlagsBits.ManageNicknames))
        return interaction.editReply({ content: "❌ I don’t have permission to change nicknames."});

    // role hierarchy
    if (commandMember.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has higher or equal role than you."});
    if (botMember.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has higher or equal role than me."});

    // nickname change
    try {
        const action = nickname ? `changed nickname to **${nickname}**` : 'reset nickname';
        return interaction.editReply({ content: `✅ Successfully ${action} for *${user.tag}*`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Couldn't change nickname of this user."});
    }
};

// exports
module.exports = { data, handler };