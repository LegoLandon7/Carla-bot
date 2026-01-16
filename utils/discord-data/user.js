// resolve user
async function getUser(input, guild) {
    // checks
    if (!input || !guild) return null;
    input = input.trim();

    // mention
    const mention = input.match(/^<@!?(\d+)>$/);
    if (mention) return (await guild.members.fetch(mention[1]).catch(() => null))?.user || null;

    // id
    if (/^\d+$/.test(input)) return (await guild.members.fetch(input).catch(() => null))?.user || null;

    // search cache
    const member = guild.members.cache.find(
        m =>
            m.user.username.toLowerCase() === input.toLowerCase() ||
            (m.nickname && m.nickname.toLowerCase() === input.toLowerCase())
    );

    // return
    return member ? member.user : null;
}

// get command user data (must defer reply and have target_user string field thats required)
async function getCommandUserData(interaction) {
    // checks
    const user = await getUser(interaction.options.getString('target_user'), interaction.guild);

    if (!user) {
        await interaction.editReply({content: "❌ User not found."});
        return null; // stop
    }

    // data
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const commandMember = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    const botMember = interaction.guild.members.me;

    // fallback
    if (!member || !commandMember || !botMember) {
        await interaction.editReply({content: "❌ Could not fetch member data."});
        return null; // stop
    }

    // return
    return { user, member, commandMember, botMember };
}

// mention user
function mentionUser(user) {return user ? `<@${user.id}>` : ""}

// exports
module.exports = {getUser, getCommandUserData, mentionUser};