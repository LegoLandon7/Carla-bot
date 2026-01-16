// imports
const { SlashCommandSubcommandBuilder } = require('discord.js');
const { googleSearch } = require('../../../services/search-engine.js');

// subcommand
const data = new SlashCommandSubcommandBuilder()
    .setName('search')
    .setDescription('Search google')
    .addStringOption(o => 
        o.setName('query')
        .setDescription('The query to search')
        .setRequired(true))
    .addNumberOption(o => 
        o.setName('amount')
        .setDescription('The amount to search')
        .setRequired(false))
    .addBooleanOption(o => 
        o.setName('description')
        .setDescription('Show website description (set to false on amounts > 1)')
        .setRequired(false))
    .addBooleanOption(o => 
        o.setName('embed')
        .setDescription('Show rich embeds')
        .setRequired(false));

// handler
const handler = async (interaction) => {
    await interaction.deferReply();

    // data
    let amount = interaction.options.getNumber('amount') || 1;
    if (amount < 1) amount = 1;
    if (amount > 10) amount = 10;

    const query = interaction.options.getString('query');
    let description = interaction.options.getBoolean('description') || true;
    if (amount != 1) description = false;

    // response
    const response = await googleSearch(query, amount, description);

    // output
    const embed = interaction.options.getBoolean('embed') || true;
    await interaction.editReply( embed 
        ? { content: response } 
        : { content: response, flags: 4 }
    );
}

// exports
module.exports = { data, handler };