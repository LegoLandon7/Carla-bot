// imports
const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readJson, writeJson } = require('../../../utils/data/files.js');
const { hasPermission} = require('../../../utils/discord-utils/permissions.js');
const { generateId } = require('../../../utils/data/ids.js');
const { COLORS, createEmbed} = require('../../../utils/discord-utils/embed.js');
const path = require('path');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('create')
    .setDescription('Creates a trigger')
    .addStringOption(o => 
        o.setName('trigger')
            .setDescription('The text to reply to (case insensitive) (if regex -> use double backslash)')
            .setRequired(true))
    .addStringOption(o => 
        o.setName('response')
            .setDescription('The message to reply to the trigger with')
            .setRequired(true))
    .addStringOption(o => 
        o.setName('match_type')
            .setDescription('Match the trigger to a certain type')
            .addChoices( 
                { name: 'Normal', value: 'normal' },
                { name: 'Strict', value: 'strict' },
                { name: 'Exact', value: 'exact' },
                { name: 'Regex', value: 'regex' },
                { name: 'Ends with', value: 'ends' },
                { name: 'Starts with', value: 'starts' },
                { name: 'Word', value: 'word' },
                { name: 'Word ends with', value: 'word_end' },
                { name: 'Word starts with', value: 'word_start' }
            ).setRequired(false))
    .addStringOption(o => 
        o.setName('response_type')
            .setDescription('Respond a certain way')
            .addChoices( 
                { name: 'Normal', value: 'normal' },
                { name: 'Custom', value: 'custom' },
                { name: 'Reply', value: 'reply' }
            ).setRequired(false))

// subcommand
const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const triggerData = readJson(path.resolve(__dirname, '../../../data/triggers.json'));

    const response = interaction.options.getString('response');
    const trigger = interaction.options.getString('trigger');

    const matchType = interaction.options.getString('match_type') || 'normal';
    const responseType = interaction.options.getString('response_type') || 'normal';

    // permissions
    if (!interaction.inGuild())
        return interaction.editReply({ content: "❌ This command can only be used in servers." });
    if (!hasPermission(interaction.member, PermissionFlagsBits.ManageMessages))
        return interaction.editReply({ content: "❌ You need `Manage Messages` permission."});

    // checks
    const guildId = interaction.guild.id;
    const id = await generateId(guildId, 'triggers');

    if (response.length > 250 || trigger.length > 250)
        return interaction.editReply({ content: "❌ Max message length of 250."});
    let sameName = false;
    for (const id in triggerData[guildId]) {
        const entry = triggerData[guildId][id];
        if (entry.trigger === trigger) sameName = true;
    }

    // write data
    if (!triggerData[guildId]) 
        triggerData[guildId] = {};

    // create trigger
    triggerData[guildId][id] = {
        trigger: trigger,
        response: response,
        enabled: true,
        matchType: matchType,
        responseType: responseType
    };

    writeJson(path.resolve(__dirname, '../../../data/triggers.json'), triggerData);

    // output
    const entry = triggerData[guildId][id];
    const output = `**ID: **\`${id}\` | ${entry.enabled ? '[ENABLED]' : '[DISABLED]'}\n` +
        `- **Trigger:** ${entry.trigger}\n` +
        `- **Response:** ${entry.response}\n` +
        `- **Match Type:** [${entry.matchType.toUpperCase()}]\n` +
        `- **Response Type:** [${entry.responseType.toUpperCase()}]\n` +
        `${sameName ? '\nnote: *A trigger with the same name already exists, the order the triggers were made take precedence*' : '\nnote: *triggers have a cooldown of 5 seconds.*'}`;

    // embed
    let embed = createEmbed(`⚡ Succesfully created trigger: **${id}**`, output,
        COLORS.GOOD, interaction.user, false, false, null);

    // message
    return interaction.editReply({ embeds: [embed]});
};

// exports
module.exports = { data, handler };