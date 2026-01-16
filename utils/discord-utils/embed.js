// imports
const { EmbedBuilder } = require("discord.js");
const { Pagination } = require('pagination.djs');

// colors
const COLORS = {
    GOOD: "#43b581",
    BAD: "#f04747",
    NORMAL: "#ffdd00",
    NEUTRAL: "#747f8d",
    INFO: "#616df0",
};

// create embed
function createEmbed(title, text, color = COLORS.NEUTRAL, user = null, showId = true, thumbnail = null, image = null) {
    // embed
    const embed = new EmbedBuilder().setTitle(title).setDescription(text).setColor(color).setTimestamp();

    // images
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (image) embed.setImage(image);
    
    // footer
    if (user) {
        let footer = `${user.tag}`;
        if (showId) footer += ` | ${user.id};`;
        embed.setFooter({text: footer, iconURL: user.displayAvatarURL({dynamic: true})});
    }

    // return
    return embed;
}

// muilti page object - embeds of objects
class multiPageObjectEmbed {
    static pageSize = 5;
    static timeAlloted = 60 * 1000;

    embedOutput = [];
    
    constructor(interaction, guildObjects, objectType, inputDescription = (id, entry) => '') {
        // checks
        if (!guildObjects || typeof inputDescription !== 'function') return;

        // init
        const objects = Object.entries(guildObjects);
        const totalPages = Math.ceil(objects.length / multiPageObjectEmbed.pageSize);

        // build pages
        for (let i = 0; i < objects.length; i += multiPageObjectEmbed.pageSize) {
            const slice = objects.slice(i, i + multiPageObjectEmbed.pageSize);

            // build embed description
            const description = slice
                .map(([id, entry]) => inputDescription(id, entry))
                .filter(Boolean).join('\n\n') || '❌ No triggers found.';

            // entries
            const startObject = i + 1;
            const endObject = Math.min(i + multiPageObjectEmbed.pageSize, objects.length);
            const currentPage = Math.floor(i / multiPageObjectEmbed.pageSize) + 1;

            // build embed
            const embed = createEmbed(
                `⚡ **${interaction.guild.name}'s** ${objectType} - Page (${currentPage}/${totalPages})`,
                description, COLORS.INFO, null, false, false, null
            ).setFooter({ text: `Showing ${startObject} - ${endObject} of ${objects.length} entries` });

            this.embedOutput.push(embed);
        }
    }

    // render pagination
    render(interaction) {
        new Pagination(interaction)
        .setEmbeds(this.embedOutput)
        .setAuthorizedUsers([interaction.user.id])
        .setIdle(multiPageObjectEmbed.timeAlloted)
        .render();
    }
}

// exports
module.exports = {COLORS, createEmbed, multiPageObjectEmbed};