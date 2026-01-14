const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { ensureJson, readJson, writeJson } = require('../../../utils/files.js');
const { hasPermission, botHasPermission } = require('../../../utils/permissions.js');
const { durationToMs, msToDuration } = require('../../../utils/time.js');
const path = require('path');

const data = new SlashCommandSubcommandBuilder()
    .setName('create')
    .setDescription('Creates a trigger')
    .addStringOption(o => 
        o.setName('trigger')
            .setDescription('The text to reply to (case insensitive)')
            .setRequired(true))
    .addStringOption(o => 
        o.setName('response')
            .setDescription('The message to reply to the trigger with')
            .setRequired(true))
    .addStringOption(o => 
        o.setName('id')
            .setDescription('The id to refer to the trigger as')
            .setRequired(true))
    .addStringOption(o => 
        o.setName('match_type')
            .setDescription('Match the trigger to a certain type')
            .addChoices( 
                { name: 'Normal', value: 'normal' },
                { name: 'Strict', value: 'strict' },
                { name: 'Exact', value: 'exact' },
                { name: 'Regex', value: 'regex' },
                { name: 'Ends end', value: 'ends' },
                { name: 'Starts with', value: 'starts' },
                { name: 'Word', value: 'word' }
            ).setRequired(false))
    .addStringOption(o => 
        o.setName('response_type')
            .setDescription('Respond a certain way')
            .addChoices( 
                { name: 'Normal', value: 'normal' },
                { name: 'Custom', value: 'custom' },
                { name: 'Reply', value: 'reply' }
            ).setRequired(false))

const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const response = interaction.options.getString('response');
    const trigger = interaction.options.getString('trigger');
    const id = interaction.options.getString('id');

    const matchType = interaction.options.getString('match_type') || 'normal';
    const responseType = interaction.options.getString('response_type') || 'normal';

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));

    // checks
    const guildId = interaction.guild.id;

    if (triggerData?.[guildId]?.[id])
        return interaction.editReply({content: "❌ A trigger with the same id already exists."});
    let sameName = false;
    for (const id in triggerData[guildId]) {
        const entry = triggerData[guildId][id];
        if (entry.trigger === trigger) sameName = true;
    }

    // write data
    if (!triggerData[guildId]) 
        triggerData[guildId] = {};

    let newTrigger = trigger;
    if (matchType === 'regex') newTrigger = trigger.replace(/\\/g, "\\\\");

    triggerData[guildId][id] = {
        trigger: newTrigger,
        response: response,
        enabled: true,
        matchType: matchType,
        responseType: responseType
    };

    writeJson(path.resolve(path.resolve(__dirname, '../../../data/triggers.json')), triggerData);

    return interaction.editReply({ content: `✅ Succesfully created trigger with id: ${'`' + id + '`'}${sameName ? '\nnote: *A trigger with the same name already exists, the order the triggers were made take precedence*' : '\nnote: *triggers have a cooldown of 5 seconds.*'}`});
};

module.exports = { data, handler };