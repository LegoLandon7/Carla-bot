// imports
const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson, writeJson } = require('../../../utils/data/files.js');
const { hasPermission } = require('../../../utils/discord-utils/permissions.js');
const { durationToMs, msToDuration } = require('../../../utils/other/time.js');
const { generateId } = require('../../../utils/data/ids.js');
const { mentionChannel } = require('../../../utils/discord-data/channel.js');
const { COLORS, createEmbed} = require('../../../utils/discord-utils/embed.js');
const path = require('path');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('create')
    .setDescription('Creates a timer')
    .addStringOption(o => 
        o.setName('time')
            .setDescription('The amount of time in-between sending each message')
            .setRequired(true))
    .addStringOption(o => 
        o.setName('response')
            .setDescription('The message to say')
            .setRequired(true))
    .addChannelOption(o => 
        o.setName('target_channel')
            .setDescription('The channel to send the message in')
            .setRequired(true))
    .addBooleanOption(o => 
        o.setName('sent_reset')
            .setDescription('Reset the timer when a message is sent?')
            .setRequired(false))
    .addStringOption(o => 
        o.setName('message_reset')
            .setDescription('Reset the timer when this message is sent (case insensitive)')
            .setRequired(false));

// handler
const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const timerData = readJson(path.resolve(__dirname, '../../../data/timers.json'));

    const sentReset = interaction.options.getBoolean('sent_reset') || false;
    const messageReset = interaction.options.getString('message_reset') || null;

    const time = interaction.options.getString('time');
    const msTime = durationToMs(time);

    const channel = interaction.options.getChannel('target_channel');
    const response = interaction.options.getString('response');

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    // checks
    const guildId = interaction.guild.id;
    const channelId = channel.id;
    const id = await generateId(guildId, 'timers');

    if (response.length > 250 || id.length > 250)
        return interaction.editReply({ content: "❌ Max message length of 250."});
    if (timerData?.[guildId]?.[id])
        return interaction.editReply({content: "❌ A timer with the same id already exists."});
    if (!msTime || msTime <= 0)
        return interaction.editReply({ content: "❌ Invalid time format." });
    if (!channel.isTextBased())
        return interaction.editReply({ content: "❌ That channel is not text-based." });

    // write data
    if (!timerData[guildId]) 
        timerData[guildId] = {};

    timerData[guildId][id] = {
        timeMs: msTime,
        response: response,
        channelId: channelId,
        enabled: true,
        sentReset: sentReset,
        messageReset: messageReset
    };

    writeJson(path.resolve(path.resolve(__dirname, '../../../data/timers.json')), timerData);

    // output
    const entry = timerData[guildId][id];
    const output = `**ID: ** \`${id}\` | *${msToDuration(entry.timeMs)}* | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
        `- **Channel:** ${mentionChannel(interaction.guild.channels.cache.get(entry.channelId))}\n` +
        `- **Reset:** ${entry.messageReset ? `[YES] : ${entry.messageReset}` : (entry.sentReset ? '[YES]' : '[NO]')}\n` +
        `- **Response:** ${entry.response}\n` +
        `\n*note: timers refresh at a max limit of 5 seconds.*`;

    // embed
    const embed = createEmbed(`⏲️ Succesfully created timer: **${id}**`, output,
        COLORS.GOOD, interaction.user, false, false, null);

    // message
    return interaction.editReply({ embeds: [embed]});
};

// exports
module.exports = { data, handler };