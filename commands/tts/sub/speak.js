const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { ttsOutput } = require('../../../services/tts_model.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('speak')
    .setDescription('Sends an mp3 file of text')
    .addStringOption(o => 
        o.setName('text')
        .setDescription('The text to speak')
        .setRequired(true));

const handler = async (interaction) => {
    await interaction.deferReply();

    const text = interaction.options.getString('text');
    if (text.length > 250)
        return interaction.editReply({ content: "❌ Max message length of 250."});

    const buffer = await ttsOutput(text);
    const attachment = new AttachmentBuilder(buffer, { name: 'output.mp3' });
    await interaction.editReply({ files: [attachment] });
}

module.exports = { data, handler };