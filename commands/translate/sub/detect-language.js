// imports
const { SlashCommandSubcommandBuilder } = require('discord.js');
const { detectLanguage, languages } = require('../../../services/translate-model.js');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('detect-language')
    .setDescription('Detects the texts language')
    .addStringOption(o => 
        o.setName('text')
        .setDescription('The text to detect the language from')
        .setRequired(true));

// handler
const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const text = interaction.options.getString('text');
    if (text.length > 250)
        return interaction.editReply({ content: "❌ Max message length of 250."});

    // detect
    try {
        const code = await detectLanguage(text);
        const language = languages.find(lang => lang.value === code)?.name ?? 'Unknown';
        return interaction.editReply({ content: `🌐 The language is: ${'`' + language + '`'}`});
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "⚠️ Something went wrong"});
    }
}

// exports
module.exports = { data, handler };