const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('echo')
    .setDescription('Sends a message')
    .addChannelOption(o =>
        o.setName('target_channel')
         .setDescription('Channel to send the message in')
         .setRequired(true))
    .addStringOption(o =>
        o.setName('message')
         .setDescription('Message to send')
         .setRequired(true));

const handler = async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    const userData = await getCommandUserData(interaction);
    if (!userData) return; const { user, member, commandUser, botMember } = userData;

    const target_channel = interaction.options.getChannel('target_channel');
    const message = interaction.options.getString('message');

    // permissions
    if (!hasPermission(commandUser, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    // echo
    try {
        await target_channel.send({ content: message});
        return interaction.editReply({ content: `✅ Successfully sent echo: **${message}**.`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Couldn't send echo. Check if I have permissions."});
    }
};

module.exports = { data, handler };