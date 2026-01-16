// resolve channel
function getChannel(input, guild) {
    // checks
    if (!guild || !input) return null;

    // mentions
    const mention = input.match(/^<#(\d+)>$/);
    if (mention) return guild.channels.cache.get(mention[1]) || null;

    // ids
    if (/^\d+$/.test(input)) return guild.channels.cache.get(input) || null;

    // names
    return guild.channels.cache.find(r => r.name === input) || null;
}

// mention channel
function mentionChannel(channel) {return channel ? `<#${channel.id}>` : ""}

// exports
module.exports = {getChannel, mentionChannel};