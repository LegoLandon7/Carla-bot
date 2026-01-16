// imports
const { createEmbed, COLORS } = require('../../utils/discord-utils/embed.js');
const { SlashCommandBuilder } = require('discord.js');

// subcommand
const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency');

// execute
const execute = async (interaction) => {
    await interaction.deferReply();

    // data
    const latency = Date.now() - interaction.createdTimestamp;
    const wsPing = Math.round(interaction.client.ws.ping);

    // output
    const embed = createEmbed('🏓 **Pong**', `**- Latency: **${latency}ms\n**- Websocket: **${wsPing}ms`,
            COLORS.INFO, interaction.user, false);
    await interaction.editReply({embeds: [embed]});
}


// exports
module.exports = { data, execute, cooldown: 10 };