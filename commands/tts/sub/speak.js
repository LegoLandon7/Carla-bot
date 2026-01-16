// imports
const { SlashCommandSubcommandBuilder, AttachmentBuilder } = require('discord.js');
const { ttsOutput } = require('../../../services/tts-model.js');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('speak')
    .setDescription('Sends an mp3 file of text')
    .addStringOption(o => 
        o.setName('text')
        .setDescription('The text to speak')
        .setRequired(true));

// handler
const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const text = interaction.options.getString('text');
    if (text.length > 250)
        return interaction.editReply({ content: "❌ Max message length of 250."});

    // output
    const buffer = await ttsOutput(text);
    if (!buffer) 
        return interaction.editReply({ content: "⚠️ Something went wrong"});
    const attachment = new AttachmentBuilder(buffer, { name: 'output.mp3' });
    await interaction.editReply({ files: [attachment] });
}

// exports
module.exports = { data, handler };