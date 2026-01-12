const { SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { ttsOutput } = require('../../../services/tts_model.js');
const { detectLanguage, translateText, languages } = require('../../../services/translate_model.js');

const data = new SlashCommandSubcommandBuilder()
    .setName('text')
    .setDescription('Translates the text')
    .addStringOption(o => 
        o.setName('text')
        .setDescription('The text to translate')
        .setRequired(true))
    .addStringOption(o => 
        o.setName('from-language')
        .setDescription('The language to translate from')
        .addChoices( { name: 'Auto Detect', value: 'auto' }, ...languages)
        .setRequired(false))
    .addStringOption(o => 
        o.setName('to-language')
        .setDescription('The language to translate to')
        .addChoices(...languages)
        .setRequired(false))
    .addBooleanOption(o => 
        o.setName('speak')
        .setDescription('Speak the translation?')
        .setRequired(false));

const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    const text = interaction.options.getString('text');
    if (text.length > 250)
        return interaction.editReply({ content: "❌ Max message length of 250."});

    let from = interaction.options.getString('from-language') || 'auto';
    const to = interaction.options.getString('to-language') || 'en';

    const speak = interaction.options.getBoolean('speak');

    try {
        const output = await translateText(text, from, to);
        if (!output) 
            return interaction.editReply({ content: "⚠️ Something went wrong"});
        if (speak) {
            // original speak
            const originalBuffer = await ttsOutput(text);
            if (!originalBuffer) 
                return interaction.editReply({ content: "⚠️ Something went wrong"});
            const original = new AttachmentBuilder(originalBuffer, { name: 'original.mp3' });

            // translated speak
            const translatedBuffer = await ttsOutput(output);
            if (!translatedBuffer) 
                return interaction.editReply({ content: "⚠️ Something went wrong"});
            const translated = new AttachmentBuilder(translatedBuffer, { name: 'translated.mp3' });

            // detect
            if (from === 'auto') from = await detectLanguage(text);
            const originalLang = languages.find(lang => lang.value === from)?.name ?? '[Unknown]';
            const translatedLang = languages.find(lang => lang.value === to)?.name ?? '[Unknown]';

            // reply
            await interaction.editReply({ content: `🌐 **${originalLang}** -> **${translatedLang}** \n\n${'`' + text + '`'}\n->\n${'`' + output + '`'}`,
                files: [original, translated] });
        } else {
            // detect
            if (from === 'auto') from = await detectLanguage(text);
            const originalLang = languages.find(lang => lang.value === from)?.name ?? '[Unknown]';
            const translatedLang = languages.find(lang => lang.value === to)?.name ?? '[Unknown]';

            // dont speak
            await interaction.editReply({ content: `🌐 **${originalLang}** -> **${translatedLang}** \n\n${'`' + text + '`'}\n->\n${'`' + output + '`'}`});
        }
    } catch (err) {
        console.error(err);
        return interaction.editReply({ content: "⚠️ Something went wrong"});
    }
}

module.exports = { data, handler };