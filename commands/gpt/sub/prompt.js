const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { getAIResponse, CONTEXTS } = require('../../../services/ai_model.js');

const userHistory = {};

const data = new SlashCommandSubcommandBuilder()
    .setName('prompt')
    .setDescription('Ask ChatGPT a prompt (stores history per user)')
    .addStringOption(o => 
        o.setName('prompt')
        .setDescription('The prompt to ask')
        .setRequired(true));

const handler = async (interaction) => {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const prompt = interaction.options.getString('prompt');

    if (prompt.length > 250)
        return interaction.editReply({ content: "❌ Max message length of 250."});

    if (!userHistory[userId]) userHistory[userId] = [];

    userHistory[userId].push(`User: ${prompt}`);
    if (userHistory[userId].length > 10)
        userHistory[userId].shift();

    const fullPrompt = userHistory[userId].join('\n');

    const output = await getAIResponse(fullPrompt, CONTEXTS.BASE_CONTEXT, 'gpt-5-mini');
    await interaction.editReply(`**Prompt:** ${prompt}\n**Output:** ${output}`);

    userHistory[userId].push(`Bot: ${output}`);
    if (userHistory[userId].length > 10)
        userHistory[userId].shift();
}

module.exports = { data, handler };