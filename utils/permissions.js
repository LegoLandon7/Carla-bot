// imports
const { PermissionsBitField, PermissionFlagsBits } = require("discord.js");

// member permissions
function hasPermission(member, perms) {
     if (!member) return false;
    perms = Array.isArray(perms) ? perms : [perms];

    // string to bitfield
    const flags = perms.map(p => typeof p === "string" ? PermissionsBitField.Flags[p] ?? 0n : p);

    // checks
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
    if (member.id === member.guild.ownerId) return true;

    // return
    return member.permissions.has(flags, true);
}

// bot has permissions
function botHasPermission(client, guild, perms) {
    if (!client.user || !guild) return false;
    const botMember = guild.members.cache.get(client.user.id);
    if (!botMember) return false;
    return hasPermission(botMember, perms);
}

// exports
module.exports = {hasPermission, botHasPermission}