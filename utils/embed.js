// imports
const { EmbedBuilder } = require("discord.js");

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

// exports
module.exports = {COLORS, createEmbed};