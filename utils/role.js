// resolve role
function getRole(input, guild) {
    if (!guild || !input) return null;

    // ids
    if (/^\d+$/.test(input)) return guild.roles.cache.get(input) || null;

    // names
    return guild.roles.cache.find(r => r.name === input) || null;
}

// get roles
function getRoles(member, interaction) {
    const roles = member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .map(r => r)
        .reverse();
    return roles.length ? roles.join('') : '[NONE]';
}

// mention role
function mentionRole(role) {return role ? `<@${role.id}>` : ""}

module.exports = {getRole, mentionRole, getRoles};