// ping.js
const { createEmbed, COLORS } = require('../../utils/embed.js');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency');

const execute = async (interaction) => {
    await interaction.deferReply();

    const latency = Date.now() - interaction.createdTimestamp;
    const wsPing = Math.round(interaction.client.ws.ping);

    const embed = createEmbed('🏓 **Pong**', `**• Latency: **${latency}ms\n**• Websocket: **${wsPing}ms`,
            COLORS.INFO, interaction.user, false);
    await interaction.editReply({embeds: [embed]});
}

module.exports = { data, execute, cooldown: 10 };
