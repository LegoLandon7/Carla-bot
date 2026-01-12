const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('dm')
    .setDescription('Dm a message to a user')
    .addUserOption(o =>
        o.setName('target_user')
         .setDescription('User to send the dm to')
         .setRequired(true))
    .addStringOption(o =>
        o.setName('message')
         .setDescription('Message to dm')
         .setRequired(true));

const handler = async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    const target_user = interaction.options.getUser('target_user');
    const message = interaction.options.getString('message');

    // permissions
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});
    if (target_user.bot)
        return interaction.editReply({ content: "❌ You can't DM bots." });

    // dm
    try {
        await target_user.send({ content: message});
        return interaction.editReply({ content: `✅ Successfully sent dm: **${message}**.`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Couldn't send dm."});
    }
};

module.exports = { data, handler };