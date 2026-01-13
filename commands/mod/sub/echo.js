const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');
const { getCommandUserData } = require('../../../utils/user.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('echo')
    .setDescription('Sends a message')
    .addStringOption(o =>
        o.setName('message')
        .setDescription('Message to send')
        .setRequired(true))
    .addChannelOption(o =>
        o.setName('target_channel')
        .setDescription('Channel to send the message in')
        .setRequired(false))
    .addStringOption(o =>
        o.setName('target_message_id')
        .setDescription('the message to reply to')
        .setRequired(false));

const handler = async (interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });

    // data
    const target_channel = interaction.options.getChannel('target_channel') || interaction.channel;
    const messageId = interaction.options.getString('target_message_id') || null;
    const message = interaction.options.getString('message');

    // permissions
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    // echo
    try {
        if (messageId) {
            const messageFetched = await target_channel.messages.fetch(messageId);
            if (!messageFetched)
                return interaction.editReply({ content: "❌ Message ID not found. Check if the target_channel is correct."});

            await messageFetched.reply({ content: message })
        } else {
            await target_channel.send({ content: message });
        }
        return interaction.editReply({ content: `✅ Successfully sent echo: **${message}**.`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "❌ Couldn't send echo. Check if I have permissions."});
    }
};

module.exports = { data, handler };