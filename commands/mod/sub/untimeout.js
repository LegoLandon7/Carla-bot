// imports
const { SlashCommandSubcommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/discord-data/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/discord-utils/permissions.js');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('untimeout')
    .setDescription('Removes timeout from a user')
    .addStringOption(o =>
        o.setName('target_user')
         .setDescription('User to remove timeout from (mention, ID, or username)')
         .setRequired(true))
    .addStringOption(o =>
        o.setName('reason')
         .setDescription('Reason for removing timeout')
         .setRequired(false)
    );

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
    if (!hasPermission(commandMember, PermissionFlagsBits.ModerateMembers))
        return interaction.editReply({ content: "❌ You need `Timeout Members` permission."});
    if (!botHasPermission(interaction.client, interaction.guild, PermissionFlagsBits.ModerateMembers))
        return interaction.editReply({ content: "❌ I don’t have permission to remove timeouts."});

    // check if user is timed out
    if (!member.communicationDisabledUntil || member.communicationDisabledUntil <= new Date())
        return interaction.editReply({ content: "❌ This user is not currently timed out."});

    // role hierarchy
    if (commandMember.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has a higher or equal role than you."});
    if (botMember.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has a higher or equal role than me."});

    // self checks
    if (user.id === interaction.client.user.id)
        return interaction.editReply({ content: "❌ Cannot remove timeout from myself."});
    if (interaction.user.id === user.id)
        return interaction.editReply({ content: "❌ Cannot remove timeout from yourself."});
    if (user.bot)
        return interaction.editReply({ content: "❌ Cannot remove timeout from a bot."});

    // remove timeout
    try {
        await member.user.send(`⏳ Timeout removed in **${interaction.guild.name}**\nReason: ${reason}`)
            .catch(() => console.log(`⚠️ Could not DM ${member.user.tag}`));
        await member.timeout(null, reason);
        return interaction.editReply({ content: `✅ Removed timeout from **${user.tag}**`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Couldn't remove timeout from user."});
    }
};

// exports
module.exports = { data, handler };