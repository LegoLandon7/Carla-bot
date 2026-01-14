// resolve role
function getRole(input, guild) {
    // checks
    if (!guild || !input) return null;

    // ids
    if (/^\d+$/.test(input)) return guild.roles.cache.get(input) || null;

    // names
    return guild.roles.cache.find(r => r.name === input) || null;
}

// get member roles
function getRoles(member, interaction) {
    const roles = member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .map(r => r)
        .reverse();

    // return
    return roles.length ? roles.join('') : '[NONE]';
}

// mention role
function mentionRole(role) {return role ? `<@${role.id}>` : ""}

// exports
module.exports = {getRole, mentionRole, getRoles};