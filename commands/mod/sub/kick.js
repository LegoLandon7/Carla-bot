const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/discord-data/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/discord-utils/permissions.js');
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

// handler
const handler = async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    const userData = await getCommandUserData(interaction);
    if (!userData) return; const { user, member, commandMember, botMember } = userData;

    const reason = interaction.options.getString('reason') || 'No reason provided';

    // permissions
    if (!hasPermission(commandMember, PermissionFlagsBits.KickMembers))
        return interaction.editReply({ content: "❌ You need `Kick Members` permission."});
    if (!botHasPermission(interaction.client, interaction.guild, PermissionFlagsBits.KickMembers))
        return interaction.editReply({ content: "❌ I don’t have permission to kick members."});

    // role hierarchy
    if (commandMember.roles.highest.position <= member.roles.highest.position)
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

    // kick
    try {
        await member.kick({ reason });
        await user.send(`❌ You have been kicked from **${interaction.guild.name}** for: ${reason}`)
        .catch(() => console.log(`⚠️ Could not DM ${user.tag}`));
        return interaction.editReply({ content: `✅ Successfully kicked ${user.tag}`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Couldn't kick user."});
    }
};

// exports
module.exports = { data, handler };