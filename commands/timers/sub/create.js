const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { ensureJson, readJson, writeJson } = require('../../../utils/files.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { durationToMs, msToDuration } = require('../../../utils/time.js');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('create')
    .setDescription('Creates a timer')
    .addStringOption(option => 
        option
            .setName('time')
            .setDescription('The amount of time in-between sending each message')
            .setRequired(true))
    .addStringOption(option => 
        option
            .setName('message')
            .setDescription('The message to say')
            .setRequired(true))
    .addChannelOption(option => 
        option
            .setName('target_channel')
            .setDescription('The channel to send the message in')
            .setRequired(true))
    .addStringOption(option => 
        option
            .setName('id')
            .setDescription('The id to refer to the timer as')
            .setRequired(true));

const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const time = interaction.options.getString('time');
    const msTime = durationToMs(time);

    const channel = interaction.options.getChannel('target_channel');

    const message = interaction.options.getString('message');
    const id = interaction.options.getString('id');

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageGuild))
        return interaction.editReply({ content: "❌ You need `Manage Guild` permission."});

    const timerData = readJson(path.resolve(__dirname, '../../../data/timers.json'));

    // checks
    const guildId = interaction.guild.id;
    const channelId = channel.id;

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
        message: message,
        channelId: channelId,
        enabled: true
    };

    writeJson(path.resolve(path.resolve(__dirname, '../../../data/timers.json')), timerData);

    return interaction.editReply({ content: `✅ Succesfully created timer with id: ${'`' + id + '`'}\n*note: timers refresh at a max limit of 5 seconds.*`});
};

module.exports = { data, handler };