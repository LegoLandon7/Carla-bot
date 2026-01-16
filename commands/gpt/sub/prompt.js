// imports
const { SlashCommandSubcommandBuilder } = require('discord.js');
const { getAIResponse, CONTEXTS } = require('../../../services/ai-model.js');

const userHistory = {};

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('prompt')
    .setDescription('Ask ChatGPT a prompt (stores history per user)')
    .addStringOption(o => 
        o.setName('prompt')
        .setDescription('The prompt to ask')
        .setRequired(true));

// handler
const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const userId = interaction.user.id;
    const prompt = interaction.options.getString('prompt');

    if (prompt.length > 250)
        return interaction.editReply({ content: "❌ Max message length of 250."});

    if (!userHistory[userId]) userHistory[userId] = [];

    // write history
    userHistory[userId].push(`User: ${prompt}`);
    if (userHistory[userId].length > 10)
        userHistory[userId].shift();

    const fullPrompt = userHistory[userId].join('\n');

    // output
    const output = await getAIResponse(fullPrompt, CONTEXTS.BASE_CONTEXT, 'gpt-5-mini');
    await interaction.editReply(`**Prompt:** ${prompt}\n\n**Output:** ${output}`);

    // write history
    userHistory[userId].push(`Bot: ${output}`);
    if (userHistory[userId].length > 10)
        userHistory[userId].shift();
}

// exports
module.exports = { data, handler };