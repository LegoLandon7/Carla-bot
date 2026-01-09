const { SlashCommandSubcommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { durationToMs } = require('../../../utils/time.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a user')
    .addStringOption(o =>
        o.setName('target_user')
         .setDescription('User to timeout (mention, ID, or username)')
         .setRequired(true))
    .addStringOption(o =>
        o.setName('duration')
         .setDescription('Duration in 5d 3h format')
         .setRequired(true))
    .addStringOption(o =>
        o.setName('reason')
         .setDescription('Reason for timeout')
         .setRequired(false));

const handler = async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    const userData = await getCommandUserData(interaction);
    if (!userData) return; const { user, member, commandUser, botMember } = userData;

    const targetInput = interaction.options.getString('target_user');
    const durationInput = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // permissions
    if (!hasPermission(commandUser, PermissionFlagsBits.ModerateMembers))
        return interaction.editReply({ content: "❌ You need `Timeout Members` permission."});
    if (!botHasPermission(interaction.client, interaction.guild, PermissionFlagsBits.ModerateMembers))
        return interaction.editReply({ content: "❌ I don’t have permission to timeout members."});

    // already timed out
    if (member.communicationDisabledUntil && member.communicationDisabledUntil > new Date())
        return interaction.editReply({ content: "❌ This user is currently timed out."});

    // duration checks
    const durationMs = durationToMs(durationInput);
    if (!durationMs) return interaction.editReply({ content: "❌ Invalid time format."});
    if (durationMs > 28 * 24 * 60 * 60 * 1000)
        return interaction.editReply({ content: "❌ Timeout cannot exceed 28 days."});

    // role hierarchy
    if (commandUser.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has a higher or equal role than you."});
    if (botMember.roles.highest.position <= member.roles.highest.position)
        return interaction.editReply({ content: "❌ User has a higher or equal role than me."});

    // self checks
    if (user.id === interaction.client.user.id)
        return interaction.editReply({ content: "❌ Cannot timeout myself."});
    if (interaction.user.id === user.id)
        return interaction.editReply({ content: "❌ Cannot timeout yourself."});
    if (user.bot)
        return interaction.editReply({ content: "❌ Cannot timeout a bot."});

    // timeout
    try {
        await member.user.send(`⏳ You have been timed out in **${interaction.guild.name}** for ${durationInput}.\nReason: ${reason}`)
            .catch(() => console.log(`⚠️ Could not DM ${member.user.tag}`));
        await member.timeout(durationMs, reason);
        return interaction.editReply({ content: `✅ Timed out **${user.tag}** for **${durationInput}**`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Couldn't timeout user."});
    }
};

module.exports = { data, handler };